import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const p = z.object({ bus_id: z.string(), trip_id: z.string().optional() }).safeParse(b);
  if (!p.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const trip_id = p.data.trip_id ?? `trip-${Date.now()}`;
  store.trips.set(trip_id, { bus_id: p.data.bus_id, started_at: new Date().toISOString(), status: "active" });
  return NextResponse.json({ ok: true, trip_id });
}
export async function GET() {
  return NextResponse.json({ trips: [...store.trips.entries()].slice(-10) });
}
