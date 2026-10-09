import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({ on: true }));
  store.demo = b.on !== false;
  if (store.demo) store.demoT = 0;
  return NextResponse.json({ ok: true, on: store.demo });
}
export async function GET() {
  return NextResponse.json({ on: store.demo });
}
