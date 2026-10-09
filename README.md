# AGCRIDES — Amritsar Group of Colleges bus tracking

When to leave to catch your bus — not just where it is.

## Run (2 min, no keys needed for demo)

```bash
npm install
npm run dev
# open http://localhost:3000/student
# Admin → Start demo → student map moves with DEMO DATA
```

Simulator (second terminal):
```bash
BASE_URL=http://localhost:3000 BUS_TOKEN=demo-token-BUS-01 node simulator/sim-device.mjs
```

## With Supabase (production live)

1. Create project at supabase.com → copy URL, anon key, service_role key.
2. SQL editor → run `supabase/migrations/001_core.sql`, then `supabase/seed.sql`.
3. Copy `.env.example` → `.env.local`, fill 3 keys.
4. `npm run dev` → `/student` `/driver` `/admin`.

## Deploy (Vercel)

Import GitHub repo → add same 3 env vars → Deploy. Map uses Carto open tiles, no key.

## API

- `POST /api/v1/positions/batch` Bearer device token, idempotent `point_id`
- `GET /api/v1/live` merged live + demo
- `POST /api/v1/trips/start|/end`, `GET/POST/DELETE /api/v1/alerts`, `POST /api/v1/broadcasts`, `GET /api/v1/health`

See `docs/API.md`, `docs/KNOWN_LIMITS.md`, `docs/DEMO_SCRIPT.md`.
