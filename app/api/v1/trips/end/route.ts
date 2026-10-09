import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const t = store.trips.get(b.trip_id);
  if (t) store.trips.set(b.trip_id, { ...t, ended_at: new Date().toISOString(), status: "done" });
  return NextResponse.json({ ok: true });
}
