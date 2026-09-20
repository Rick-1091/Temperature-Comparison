"""Build a verified, pre-resolution NYC temperature snapshot with the official SDK.

Run from the project root with `.venv/Scripts/python scripts/fetch-nyc-history.py`.
Every market price is the latest SDK `as_of` quote at midnight EDT on its date.
"""

from __future__ import annotations

import asyncio
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
from polymarket import AsyncPublicClient


ROOT = Path(__file__).resolve().parents[1]
DATES = range(17, 29)
STATION = "USW00014732"  # NOAA NCEI: LaGuardia Airport, NY.
NOAA_URL = (
    "https://www.ncei.noaa.gov/access/services/data/v1"
    "?dataset=daily-summaries&stations=USW00014732"
    "&startDate=2026-08-17&endDate=2026-08-28"
    "&dataTypes=TMAX&units=standard&format=json"
)
EDT = timezone(timedelta(hours=-4))
CONCURRENCY = 5


def bounds(label: str) -> tuple[int | None, int | None, float]:
    numbers = [int(value) for value in re.findall(r"\d+", label)]
    if "or below" in label and len(numbers) == 1:
        return None, numbers[0], float(numbers[0])
    if "or higher" in label and len(numbers) == 1:
        return numbers[0], None, float(numbers[0])
    if len(numbers) == 2:
        return numbers[0], numbers[1], sum(numbers) / 2
    raise ValueError(f"Unrecognized temperature bucket: {label}")


async def with_retry(operation, description: str):
    for attempt in range(4):
        try:
            return await operation()
        except Exception:
            if attempt == 3:
                raise RuntimeError(f"Could not fetch {description}") from None
            await asyncio.sleep(1.5 * 2**attempt)


async def main() -> None:
    limiter = asyncio.Semaphore(CONCURRENCY)
    async with AsyncPublicClient() as polymarket, httpx.AsyncClient(timeout=30) as http:
        response = await http.get(NOAA_URL)
        response.raise_for_status()
        observed = {
            row["DATE"]: int(row["TMAX"])
            for row in response.json()
            if row.get("STATION") == STATION and row.get("TMAX") is not None
        }

        async def event_for(day: int):
            slug = f"highest-temperature-in-nyc-on-august-{day}-2026"
            async with limiter:
                event = await with_retry(
                    lambda: polymarket.get_event(slug=slug), slug
                )
            if not event or len(event.markets) != 11:
                raise ValueError(f"{slug}: expected 11 outcomes")
            if "LaGuardia" not in (event.description or ""):
                raise ValueError(f"{slug}: resolution station is not LaGuardia")
            return event

        events = await asyncio.gather(*(event_for(day) for day in DATES))
        day_records = []

        for day, event in zip(DATES, events):
            date = f"2026-08-{day:02d}"
            if date not in observed:
                raise ValueError(f"Missing NOAA TMAX for {date}")
            target = datetime(2026, 8, day, tzinfo=EDT).astimezone(timezone.utc)

            async def outcome_for(market):
                label = market.group_item_title
                low, high, midpoint = bounds(label)
                token_id = market.outcomes.yes.token_id
                if not token_id:
                    raise ValueError(f"{date} {label}: missing Yes token ID")

                async def fetch_point():
                    points = []
                    async for page in polymarket.list_price_history(
                        asset_id=token_id, as_of=target
                    ):
                        points.extend(page.items)
                    if len(points) != 1:
                        raise ValueError(f"Expected one as_of quote, got {len(points)}")
                    return points[0]

                async with limiter:
                    point = await with_retry(fetch_point, f"{date} {label}")
                age = (target - point.timestamp).total_seconds()
                price = float(point.price)
                if not (0 <= price <= 1 and 0 <= age <= 86400):
                    raise ValueError(f"{date} {label}: invalid or stale quote; price={price}, age={age / 3600:.1f}h, timestamp={point.timestamp}")
                return {
                    "label": label,
                    "low": low,
                    "high": high,
                    "midpoint": midpoint,
                    "price": price,
                    "quotedAt": point.timestamp.isoformat().replace("+00:00", "Z"),
                    "marketId": str(market.id),
                    "yesTokenId": token_id,
                }

            outcomes = await asyncio.gather(
                *(outcome_for(market) for market in event.markets)
            )
            outcomes.sort(key=lambda item: item["midpoint"])
            day_records.append({
                "date": date,
                "day": day,
                "actual": observed[date],
                "eventId": str(event.id),
                "marketUrl": f"https://polymarket.com/event/{event.slug}",
                "snapshotAt": target.isoformat().replace("+00:00", "Z"),
                "outcomes": outcomes,
            })
            leader = max(outcomes, key=lambda item: item["price"])
            print(f"{date}: NOAA {observed[date]}°F, market {leader['label']} "
                  f"{leader['price']:.1%}, sum {sum(o['price'] for o in outcomes):.3f}")

    collected_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    data = {
        "metadata": {
            "collectedAt": collected_at,
            "observationSource": "NOAA NCEI daily-summaries TMAX, standard units (°F)",
            "observationStation": STATION,
            "observationUrl": NOAA_URL,
            "marketSource": "Polymarket official Python SDK 0.10.0, get_event + list_price_history(as_of)",
            "snapshotPolicy": "00:00 America/New_York (EDT) on each market date, before daytime high and resolution",
            "priceMeaning": "Historical Yes-token USDC price per share, not number of bettors",
            "comparisonLimit": "NCEI daily TMAX is independent of the market's specified hourly resolution source; values can differ.",
        },
        "days": day_records,
    }
    output = ROOT / "data" / "nyc-aug-2026.json"
    output.parent.mkdir(exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "src" / "data.js").write_text(
        "const climateSnapshot = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Saved {len(day_records)} complete days to {output}")


if __name__ == "__main__":
    asyncio.run(main())

