import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  // MVP: in-app only. Web Push is stretch (see KNOWN_LIMITS).
  return NextResponse.json({ ok: true, queued: 1, title: b.title ?? "", body: b.body ?? "" });
}
export async function GET() {
  return NextResponse.json({ ok: true, note: "in-app MVP" });
}
