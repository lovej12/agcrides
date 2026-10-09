import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ alerts: store.alerts.filter((a) => !a.resolved_at).slice(-20) });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const p = z.object({ bus_id: z.string(), type: z.string(), message: z.string() }).safeParse(b);
  if (!p.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  // de-dupe: one active alert per bus+type
  if (store.alerts.some((a) => !a.resolved_at && a.bus_id === p.data.bus_id && a.type === p.data.type)) {
    return NextResponse.json({ ok: true, deduped: true });
  }
  const alert = { id: `a-${Date.now()}`, created_at: new Date().toISOString(), resolved_at: null, ...p.data };
  store.alerts.push(alert);
  return NextResponse.json({ ok: true, alert });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const a = store.alerts.find((x) => x.id === id);
  if (a) a.resolved_at = new Date().toISOString();
  return NextResponse.json({ ok: true });
}
