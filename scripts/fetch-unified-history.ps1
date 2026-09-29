param([int]$MaxDays = 9)
$ErrorActionPreference = 'Stop'
$cities = @(
  @{key='laguardia'; station='KLGA'; seriesId='10005'; zone='Eastern Standard Time'; iana='America/New_York'; unit='F'; label='New York LaGuardia Airport'},
  @{key='mexico'; station='MMMX'; seriesId='11428'; zone='Central Standard Time (Mexico)'; iana='America/Mexico_City'; unit='C'; label='Mexico City International Airport'}
)
$snapshots = @{}
foreach ($city in $cities) {
  $tz = [TimeZoneInfo]::FindSystemTimeZoneById($city.zone)
  $obsUrl = 'https://aviationweather.gov/api/data/metar?ids='+$city.station+'&hours=240&format=json'
  $observations = Invoke-RestMethod -Uri $obsUrl -TimeoutSec 30
  $eventsUrl = 'https://gamma-api.polymarket.com/events?series_id='+$city.seriesId+'&closed=true&limit=15&order=endDate&ascending=false'
  $events = Invoke-RestMethod -Uri $eventsUrl -TimeoutSec 30
  $today = [TimeZoneInfo]::ConvertTime([DateTimeOffset]::UtcNow,$tz).ToString('yyyy-MM-dd')
  $firstDate = [TimeZoneInfo]::ConvertTime([DateTimeOffset]::FromUnixTimeSeconds([long]($observations | Measure-Object obsTime -Minimum).Minimum),$tz).AddDays(1).ToString('yyyy-MM-dd')
  $records = @()
  foreach ($event in ($events | Where-Object {$_.closed -and $_.eventDate -ge $firstDate -and $_.eventDate -lt $today} | Sort-Object eventDate)) {
    if ($event.resolutionSource -notmatch $city.station.ToLower()) {continue}
    $date = $event.eventDate
    # 按站点当地日归组，避免直接按 UTC 日期切分造成两地统计口径不同。
    $dayObs = @($observations | Where-Object {$_.temp -ne $null -and [TimeZoneInfo]::ConvertTime([DateTimeOffset]::FromUnixTimeSeconds([long]$_.obsTime),$tz).ToString('yyyy-MM-dd') -eq $date})
    $hours = @($dayObs | ForEach-Object {[TimeZoneInfo]::ConvertTime([DateTimeOffset]::FromUnixTimeSeconds([long]$_.obsTime),$tz).Hour} | Sort-Object -Unique)
    # 排除覆盖不足的日期；METAR 报告最高温并非连续观测峰值或官方结算值。
    if ($dayObs.Count -lt 20 -or $hours.Count -lt 20) {continue}
    $midnight = [DateTime]::SpecifyKind([DateTime]::Parse($date),[DateTimeKind]::Unspecified)
    $target = [DateTimeOffset]::new($midnight,$tz.GetUtcOffset($midnight)).ToUnixTimeSeconds()
    $outcomes = @()
    foreach ($market in $event.markets) {
      $answers = $market.outcomes | ConvertFrom-Json
      $yesIndex = [Array]::IndexOf($answers,'Yes')
      if ($yesIndex -lt 0) {throw 'Missing Yes outcome'}
      $token = ($market.clobTokenIds | ConvertFrom-Json)[$yesIndex]
      $historyUrl = 'https://clob.polymarket.com/prices-history?market='+$token+'&startTs='+($target-86400)+'&endTs='+$target+'&fidelity=5'
      $history = Invoke-RestMethod -Uri $historyUrl -TimeoutSec 25
      # 只取当地当天开始前的最后报价，避免把结果已知后的价格当作预测。
      $point = $history.history | Where-Object {$_.t -lt $target -and $_.t -ge ($target-86400)} | Sort-Object t | Select-Object -Last 1
      if ($null -eq $point -or $point.p -lt 0 -or $point.p -gt 1) {break}
      $label = $market.groupItemTitle
      $numbers = @([regex]::Matches($label,'\d+') | ForEach-Object {[double]$_.Value})
      if ($numbers.Count -eq 0) {throw 'Unrecognized temperature outcome'}
      $low = $numbers[0]; $high = $numbers[-1]
      if ($label -match 'or below') {$low=$null}
      if ($label -match 'or higher') {$high=$null}
      $outcomes += [ordered]@{label=$label;low=$low;high=$high;midpoint=($numbers|Measure-Object -Average).Average;price=[double]$point.p;quotedAt=[DateTimeOffset]::FromUnixTimeSeconds([long]$point.t).ToString('yyyy-MM-ddTHH:mm:ssZ');marketId=[string]$market.id;yesTokenId=$token;historyUrl=$historyUrl}
    }
    if ($outcomes.Count -ne $event.markets.Count) {continue}
    $records += [ordered]@{date=$date;day=[int]$date.Substring(8,2);actualC=($dayObs|Measure-Object temp -Maximum).Maximum;observationCount=$dayObs.Count;hourCoverage=$hours.Count;firstObservation=[DateTimeOffset]::FromUnixTimeSeconds([long]($dayObs|Measure-Object obsTime -Minimum).Minimum).ToString('yyyy-MM-ddTHH:mm:ssZ');lastObservation=[DateTimeOffset]::FromUnixTimeSeconds([long]($dayObs|Measure-Object obsTime -Maximum).Maximum).ToString('yyyy-MM-ddTHH:mm:ssZ');eventId=[string]$event.id;marketUrl='https://polymarket.com/event/'+$event.slug;eventApiUrl='https://gamma-api.polymarket.com/events/slug/'+$event.slug;resolutionSource=$event.resolutionSource;snapshotAt=[DateTimeOffset]::FromUnixTimeSeconds($target).ToString('yyyy-MM-ddTHH:mm:ssZ');outcomes=@($outcomes|Sort-Object midpoint)}
  }
  $snapshots[$city.key] = [ordered]@{metadata=[ordered]@{collectedAt=[DateTimeOffset]::UtcNow.ToString('o');location=$city.label;station=$city.station;timezone=$city.iana;observationUnit='C';marketUnit=$city.unit;observationUrl=$obsUrl;eventsUrl=$eventsUrl;observationMethod='Maximum reported METAR temperature within the local calendar day; at least 20 reports spanning at least 20 distinct local hours.';snapshotPolicy='Latest Yes quote within 24 hours strictly before local midnight; CLOB fidelity 5 minutes.';comparisonMethod='Convert the unrounded Celsius maximum into the native market unit, round to the nearest whole degree for interval membership, and keep the original maximum for display. Not authoritative settlement.'};days=$records;observations=@($observations | Select-Object icaoId,obsTime,temp,rawOb)}
}
# 两地只保留共同的有效日期，防止比较不同时间窗口的历史表现。
$common = @($snapshots.laguardia.days.date | Where-Object {$_ -in $snapshots.mexico.days.date} | Sort-Object | Select-Object -Last $MaxDays)
if ($common.Count -lt 2) {throw 'Insufficient complete paired dates shared by both cities'}
foreach ($key in @('laguardia','mexico')) {$snapshots[$key].days=@($snapshots[$key].days | Where-Object {$_.date -in $common})}
[ordered]@{laguardia=$snapshots.laguardia;mexico=$snapshots.mexico} | ConvertTo-Json -Depth 14 -Compress
