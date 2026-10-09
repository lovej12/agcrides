# API — AGCRIDES v1

## Auth
`Authorization: Bearer <device-token>` — server compares SHA-256 hash. Never log tokens.

## POST /api/v1/positions/batch
```bash
curl -X POST $BASE/api/v1/positions/batch \
 -H "Authorization: Bearer demo-token-BUS-01" -H "Content-Type: application/json" \
 -d '{"bus_id":"BUS 01","trip_id":"t1","points":[{"point_id":"p1","lat":31.6,"lng":74.93,"speed_mps":7,"accuracy_m":12,"recorded_at":"2026-10-09T06:30:00.000Z"}]}'
```
Rules: max 50/batch, India bounds, no future >5min, `ON CONFLICT DO NOTHING` semantics. Returns `{accepted, duplicates}` — delete queue only on 200.

## GET /api/v1/live
Merged `bus_live` + demo driver. Client applies 60s offline rule.

## Trips / Alerts / Broadcasts / Demo / Health
See code in `app/api/v1/*`. Alerts de-dupe per bus+type. Demo `POST /api/v1/demo {"on":true}` drives 2 buses server-side.
