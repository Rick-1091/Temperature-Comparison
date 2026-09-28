$ErrorActionPreference = 'Stop'
$obsUrl = 'https://aviationweather.gov/api/data/metar?ids=MMMX&hours=240&format=json'
$observations = Invoke-RestMethod -Uri $obsUrl -TimeoutSec 30
$events = Invoke-RestMethod -Uri 'https://gamma-api.polymarket.com/events?series_id=11428&closed=true&limit=15&order=endDate&ascending=false' -TimeoutSec 30
$records = @()
$today = [DateTimeOffset]::UtcNow.ToOffset([TimeSpan]::FromHours(-6)).ToString('yyyy-MM-dd')
$earliest = ($observations | Measure-Object -Property obsTime -Minimum).Minimum
$firstDate = [DateTimeOffset]::FromUnixTimeSeconds([long]$earliest).ToOffset([TimeSpan]::FromHours(-6)).AddDays(1).ToString('yyyy-MM-dd')
foreach ($event in ($events | Where-Object { $_.closed -and $_.slug -like 'highest-temperature-in-mexico-city-*' -and $_.eventDate -ge $firstDate -and $_.eventDate -lt $today } | Sort-Object eventDate)) {
  if ($event.resolutionSource -notmatch 'mmmx') { continue }
  $date = $event.eventDate
  $dayObs = @($observations | Where-Object { $_.temp -ne $null -and [DateTimeOffset]::FromUnixTimeSeconds([long]$_.obsTime).ToOffset([TimeSpan]::FromHours(-6)).ToString('yyyy-MM-dd') -eq $date })
  if ($dayObs.Count -lt 20) { continue }
  $target = [DateTimeOffset]::Parse($date+'T00:00:00-06:00').ToUnixTimeSeconds()
  $outcomes = @()
  foreach ($market in $event.markets) {
    $token = ($market.clobTokenIds | ConvertFrom-Json)[0]
    $historyUrl = 'https://clob.polymarket.com/prices-history?market='+$token+'&startTs='+($target-86400)+'&endTs='+$target+'&fidelity=5'
    $history = Invoke-RestMethod -Uri $historyUrl -TimeoutSec 25
    $point = $history.history | Where-Object { $_.t -le $target -and $_.t -ge ($target-86400) } | Sort-Object t | Select-Object -Last 1
    if ($null -eq $point -or $point.p -lt 0 -or $point.p -gt 1) { break }
    $label = $market.groupItemTitle
    $numbers = @([regex]::Matches($label,'-?\d+') | ForEach-Object { [double]$_.Value })
    $low = $numbers[0]; $high = $numbers[-1]
    if ($label -match 'or below') { $low = $null }
    if ($label -match 'or higher') { $high = $null }
    $outcomes += [ordered]@{label=$label;low=$low;high=$high;midpoint=($numbers | Measure-Object -Average).Average;price=[double]$point.p;quotedAt=[DateTimeOffset]::FromUnixTimeSeconds([long]$point.t).ToString('yyyy-MM-ddTHH:mm:ssZ');marketId=[string]$market.id;yesTokenId=$token;historyUrl=$historyUrl}
  }
  if ($outcomes.Count -ne $event.markets.Count) { continue }
  $records += [ordered]@{date=$date;day=[int]$date.Substring(8,2);actual=($dayObs | Measure-Object -Property temp -Maximum).Maximum;observationCount=$dayObs.Count;firstObservation=[DateTimeOffset]::FromUnixTimeSeconds([long]($dayObs | Measure-Object obsTime -Minimum).Minimum).ToString('yyyy-MM-ddTHH:mm:ssZ');lastObservation=[DateTimeOffset]::FromUnixTimeSeconds([long]($dayObs | Measure-Object obsTime -Maximum).Maximum).ToString('yyyy-MM-ddTHH:mm:ssZ');eventId=[string]$event.id;marketUrl='https://polymarket.com/event/'+$event.slug;resolutionSource=$event.resolutionSource;snapshotAt=[DateTimeOffset]::FromUnixTimeSeconds($target).ToString('yyyy-MM-ddTHH:mm:ssZ');outcomes=@($outcomes | Sort-Object midpoint)}
}
if ($records.Count -eq 0) { throw 'No complete paired days with all pre-midnight quotes.' }
[ordered]@{metadata=[ordered]@{collectedAt=[DateTimeOffset]::UtcNow.ToString('o');unit='C';location='Mexico City International Airport';observationStation='MMMX';observationUrl=$obsUrl;observationSource='NOAA Aviation Weather Center METAR; maximum reported temperature per local calendar day, not daily TMAX';marketSource='Polymarket official Gamma and CLOB public APIs';snapshotPolicy='Latest available Yes quote within 24 hours before 00:00 America/Mexico_City (UTC-06:00); CLOB sampling fidelity 5 minutes';comparisonLimit='Reported METAR maximum may miss intra-hour peaks or missing reports; not an authoritative market settlement. Only paired days with at least 20 observations and all outcome quotes are included.'};days=$records;observations=@($observations | Select-Object icaoId,obsTime,temp,rawOb)} | ConvertTo-Json -Depth 12 -Compress
