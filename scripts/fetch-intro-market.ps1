$ErrorActionPreference = 'Stop'
$slug = 'highest-temperature-in-mexico-city-on-october-4-2026'
$eventApiUrl = 'https://gamma-api.polymarket.com/events/slug/' + $slug
$event = Invoke-RestMethod -Uri $eventApiUrl -TimeoutSec 30
$cutoff = [DateTimeOffset]::Parse('2026-10-04T06:00:00Z').ToUnixTimeSeconds()
$outcomes = @()
foreach ($market in $event.markets) {
  $yes = [Array]::IndexOf(($market.outcomes | ConvertFrom-Json), 'Yes')
  if ($yes -lt 0) { throw 'Missing Yes outcome' }
  $token = ($market.clobTokenIds | ConvertFrom-Json)[$yes]
  $historyUrl = 'https://clob.polymarket.com/prices-history?market='+$token+'&startTs='+($cutoff-86400)+'&endTs='+$cutoff+'&fidelity=5'
  $raw = Invoke-RestMethod -Uri $historyUrl -TimeoutSec 30
  # Only quotes before the local observation day; settlement values must never replace missing history.
  $history = @($raw.history | Where-Object {$_.t -lt $cutoff -and $_.t -ge ($cutoff-86400)} | Sort-Object t)
  $point = $history | Select-Object -Last 1
  if ($null -eq $point -or $point.p -lt 0 -or $point.p -gt 1) { throw ('Missing pre-day quote: '+$market.id) }
  $temperature = [int][regex]::Match($market.groupItemTitle, '-?\d+').Value
  $boundary = 'exact'
  if ($market.groupItemTitle -match 'or below') {$boundary='below'}
  if ($market.groupItemTitle -match 'or higher') {$boundary='above'}
  $outcomes += [ordered]@{marketId=$market.id;temperature=$temperature;boundary=$boundary;yesTokenId=$token;price=[double]$point.p;quotedAt=[DateTimeOffset]::FromUnixTimeSeconds($point.t).ToString('o');settlementPrice=[double]($market.outcomePrices|ConvertFrom-Json)[$yes];resolutionStatus=$market.umaResolutionStatus;historyUrl=$historyUrl;history=$history}
}
$data = [ordered]@{metadata=[ordered]@{eventId=$event.id;date=$event.eventDate;station='MMMX';timezone='America/Mexico_City';marketUnit='C';collectedAt=[DateTimeOffset]::UtcNow.ToString('o');cutoffAt='2026-10-04T06:00:00Z';eventApiUrl=$eventApiUrl;marketUrl='https://polymarket.com/event/'+$slug;resolutionSource=$event.resolutionSource;closed=$event.closed;policy='Latest available Yes quote in the 24 hours strictly before local 00:00 on October 4; CLOB fidelity 5 minutes. Quote times may differ. Raw prices, not normalized probabilities.'};outcomes=@($outcomes|Sort-Object temperature);rules=$event.description}
$destination = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public/signals/data'))
if ($destination -notlike 'F:\*') {throw 'Data output must remain on F:'}
# Retain upstream event and sampled histories, so the visualization is auditable and reproducible.
[IO.File]::WriteAllText((Join-Path $destination 'mexico-oct4-event-raw.json'),($event|ConvertTo-Json -Depth 25),[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $destination 'mexico-oct4-intro.json'),($data|ConvertTo-Json -Depth 25),[Text.UTF8Encoding]::new($false))
$outcomes | ForEach-Object {[pscustomobject]$_} | Select-Object temperature,boundary,price,quotedAt,settlementPrice | ConvertTo-Json
