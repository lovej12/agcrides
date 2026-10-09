import { NextResponse } from "next/server";
import { z } from "zod";
import { store, computeEta } from "@/lib/store";
import { hashToken } from "@/lib/store";

const Pt = z.object({
  point_id: z.string().min(1).max(128),
  lat: z.number().min(8).max(37), // India bounds sanity
  lng: z.number().min(68).max(98),
  speed_mps: z.number().min(0).max(60).default(0),
  accuracy_m: z.number().min(0).max(500).default(20),
  recorded_at: z.string().datetime()
});
const Body = z.object({
  bus_id: z.string().min(1).max(32),
  trip_id: z.string().max(128).nullable().optional(),
  points: z.array(Pt).max(50)
});

function authorized(req: Request): boolean {
  const h = req.headers.get("authorization") || "";
  const tok = h.replace(/^Bearer\s+/i, "").trim();
  if (!tok) return false;
  // Demo tokens accepted in MVP; production compares against device_tokens.token_hash.
  if (tok === "demo-token-BUS-01" || tok === "demo-token-BUS-02") return true;
  const hashes = (process.env.DEVICE_TOKEN_HASHES || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!hashes.length) return tok.startsWith("demo-token-"); // MVP: demo tokens only, wrong → 401
  return hashes.includes(hashToken(tok));
}

export async function POST(req: Request) {
  const id = Math.random().toString(36).slice(2, 8);
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized", request_id: id }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json", request_id: id }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid payload", issues: parsed.error.issues, request_id: id }, { status: 400 });

  const { bus_id, trip_id, points } = parsed.data;
  const now = new Date().toISOString();
  let accepted = 0;
  let duplicates = 0;
  let newest: any = null;

  for (const p of points) {
    // reject future timestamps >5 min
    if (new Date(p.recorded_at).getTime() > Date.now() + 5 * 60 * 1000) continue;
    if (store.points.has(p.point_id)) {
      duplicates++;
      continue;
    }
    store.points.set(p.point_id, { ...p, bus_id, trip_id: trip_id ?? null, received_at: now });
    accepted++;
    if (!newest || p.recorded_at > newest.recorded_at) newest = p;
  }

  if (newest) {
    const prev = store.live.get(bus_id);
    // remaining distance stub: 4 km demo; real engine uses route polyline in Phase 6
    const eta = computeEta(4, newest.speed_mps || 7);
    store.live.set(bus_id, {
      bus_id,
      bus_number: bus_id,
      route_name: prev?.route_name ?? (bus_id === "BUS 01" ? "AGC → Batala" : "AGC → Hall Gate"),
      lat: newest.lat,
      lng: newest.lng,
      speed_mps: newest.speed_mps,
      last_seen: now,
      state: (newest.speed_mps ?? 0) > 1 ? "moving" : "stopped",
      eta_min: eta.exp,
      eta_low: eta.low,
      eta_high: eta.high,
      next_stop: prev?.next_stop ?? null
    });
  }

  return NextResponse.json({ ok: true, accepted, duplicates, request_id: id });
}

export async function GET() {
  return NextResponse.json({ error: "use POST" }, { status: 405 });
}
