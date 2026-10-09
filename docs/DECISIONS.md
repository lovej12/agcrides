# AGCRIDES — DECISIONS.md (Phase 0 locked)

> Working name CampusRide → Final: **AGCRIDES**
> College: **Amritsar Group of Colleges (AGC), Amritsar, Punjab**
> Campus: 12 Km Stone, Amritsar–Jalandhar G.T. Road, Amritsar-143001
> Fleet reference: 38 buses covering Amritsar, Batala, Majitha, Beas, Tarn Taran, etc.
> City: Amritsar. Timezone: Asia/Kolkata (store UTC, display IST).

## 0. Constraints (solo 3-hour build)

- Team: 1 person. Total: 3 hours for build + modify + test.
- Execution: STRICTLY sequential. One phase at a time. No parallel building.
- Hardware: NO ESP32 / IoT. Driver phone GPS only (`watchPosition`, 10s batch).
- Style: Uber-inspired — black/white minimal, one green CTA, amber live marker only.
- Quality bar (Uber engineer standard): boring stack, typed, validated, RLS enforced,
  idempotent ingestion, no secrets in repo, every live value shows age, honest KNOWN_LIMITS.

## 1. Scope — 3-hour MVP (demo must survive without WiFi/hardware)

Must have (never cut):
1. `/student` map-first + bottom sheet + "Leave in N min" + stop timeline + offline rule (60s grey)
2. `/driver` one-button Start/End trip + 10s GPS queue in IndexedDB + retry + delay reasons
3. `/admin` live fleet map + alerts list + broadcast (in-app) + demo-mode switch
4. `POST /api/v1/positions/batch` idempotent (`point_id` ON CONFLICT DO NOTHING) + device-token hash
5. Simulator `sim-device.mjs` running 2 buses on real AGC routes
6. Supabase Auth + RLS (student read-only live, driver write own trip, admin all)
7. Deploy to Vercel + Supabase, PWA installable, 360px clean

Cut for 3h (deferred, listed in KNOWN_LIMITS):
- Real Web Push VAPID / Leave-now push → in-app banner + polling (push is Phase 8 stretch)
- Trip replay scrubber, fuel analytics, audit log, parent share links
- ESP32 firmware (sketch kept as stub only referencing same payload)
- SMS/WhatsApp, payments, native apps — never

## 2. Demo routes (locked, coords are DEMO approximations — confirm on map in Phase 7)

### Route R1: AGC Campus → Batala (BUS 01)
Via: Manawala → Verka Chowk → Kathu Nangal → Jaintipura → Batala
- S1 AGC Main Gate — 31.5770, 74.9820 — offset 0m
- S2 Manawala Chowk — 31.6100, 74.9300 — offset 8m
- S3 Verka Chowk — 31.6512, 74.8726 — offset 16m
- S4 Kathu Nangal — 31.7150, 74.9400 — offset 26m
- S5 Jaintipura — 31.7700, 75.1200 — offset 36m
- S6 Batala Bus Stand — 31.8196, 75.2028 — offset 48m

### Route R2: AGC Campus → Amritsar City Hall Gate (BUS 02)
Via: Celebration Mall → Company Bagh → Railway Station → Hall Gate
- S1 AGC Main Gate — 31.5770, 74.9820 — offset 0m
- S2 Celebration Mall — 31.6105, 74.8801 — offset 12m
- S3 Company Bagh — 31.6310, 74.8650 — offset 20m
- S4 Railway Station — 31.6338, 74.8700 — offset 26m
- S5 Hall Gate — 31.6345, 74.8600 — offset 32m

> Source: agcamritsar.in transport page (38 buses, Batala/Amritsar coverage) + PRTC
> Amritsar–Batala via Verka/Kathu Nangal/Jaintipura. Coords are rough, editable in admin builder.

## 3. Stack (do not change without asking)

- Next.js App Router + TS + Tailwind + shadcn/ui + Framer Motion (motion only for bus glide + arrival pulse)
- MapLibre GL JS, open tiles (Carto light/dark, no Google). Verify tile terms before demo.
- Supabase: Postgres + PostGIS + Auth + RLS + Realtime
- Zod on every API route. device_tokens store SHA-256 hash only.
- PWA manifest + SW stub (installable, no push in MVP)
- Deploy: Vercel (web) + Supabase (data)

## 4. Design tokens (Uber-minimal + transit amber)

- ink #000000 / surface #FFFFFF / card #FFFFFF / muted #545454
- signal (live/CTA): Uber green #06C167 for go, bus marker amber #F5A100 (only memorable element)
- go #06C167, warn #C77700, alert #D64545, mute #6B7280
- Type: Inter (Uber-like grotesk, free, tabular numerals) for all. Headings 600, ETA 700.
  Note: master prompt suggested Bricolage+Instrument — overridden per your "Uber theme" request.
- Shape: sheet 20px, buttons/chips 12px, pills 999px
- Icons: Lucide only. No emoji. Sentence case. 44px targets. 360px first.

## 5. Risks (top 5)

1. 3h solo → scope creep kills demo. Mitigation: cut line above, demo-mode fallback video.
2. Browser GPS stops on lock → label clearly, keep screen-on warning, simulator backup.
3. Supabase Realtime quota / Vercel free limits → polling fallback every 10s, verify limits.
4. Map tiles terms/rate → use Carto light, cache, lazy-load map.
5. Stale-as-live mistrust → every live value "updated X s ago", 60s → Offline grey.

## 6. Phase plan (sequential, timeboxed for 3h)

- P0 10m: this file + accounts [NOW]
- P1 30m: repo shell + Uber design system + Vercel deploy
- P2 30m: DB migrations + RLS + seed R1/R2
- P3 30m: ingestion API + simulator
- P4+P5+P7 60m: student hero + driver + admin fleet + demo-mode
- P9+P10 20m: hardening checklist + prod URL + backup video note

Next: Phase 1 shell. Do not start until you say "done" to YOU DO below.
