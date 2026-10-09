# KNOWN_LIMITS — honest prototype list (AGCRIDES)

1. Browser GPS stops when phone locks (OS kills watchPosition). Mitigation: Wake Lock + warning + simulator/demo fallback. Native foreground service would fix.
2. In-memory store when Supabase env missing — resets on redeploy. Production must set env + run migrations.
3. ETA engine is simplified (rolling speed × stub distance). Full version blends historic segment times + PostGIS route distance (Phase 6).
4. Geofence/deviation/offline run in-app + demo; DB scheduler/pg_cron not wired in MVP.
5. Push: in-app banner only. Real Web Push VAPID is stretch — needs HTTPS + keys + SW push handler.
6. RLS starter policies are open-read for demo; tighten per-role before handling real student PII.
7. Map tiles: Carto Positron, verify terms/quotas before mass demo.
8. Device-token auth open when DEVICE_TOKEN_HASHES empty (labelled prototype). Set hashes in prod.
9. Coords are approximations — confirm on admin map builder on campus.
10. No PII beyond name/role; no payments/SMS/native.
