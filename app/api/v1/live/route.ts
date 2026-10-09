import { NextResponse } from "next/server";
import { store } from "@/lib/store";

// GET /api/v1/live — merged live view + demo driver + offline rule.
// Never show stale as live: client greys out when last_seen > 60s.
export async function GET() {
  // Demo driver: advance BUS 01/02 along AGC corridor when demo on.
  if (store.demo) {
    store.demoT += 1;
    const t = store.demoT;
    const mk = (bus_id: string, route_name: string, baseLat: number, baseLng: number, next_stop: string) => {
      const lat = baseLat + t * 0.0012;
      const lng = baseLng + t * 0.0015;
      const distKm = Math.max(0.5, 6 - t * 0.12);
      const v = 7;
      const mins = Math.round((distKm * 1000) / v / 60);
      store.live.set(bus_id, {
        bus_id, bus_number: bus_id, route_name, lat, lng,
        speed_mps: v, last_seen: new Date().toISOString(), state: "moving",
        eta_min: mins, eta_low: Math.max(1, mins - 2), eta_high: mins + 3, next_stop
      });
    };
    mk("BUS 01", "AGC → Batala", 31.577, 74.982, "Verka Chowk");
    mk("BUS 02", "AGC → Hall Gate", 31.577, 74.982, "Celebration Mall");
  } else {
    // mark stale offline
    for (const [k, v] of store.live) {
      const age = (Date.now() - new Date(v.last_seen).getTime()) / 1000;
      if (age > 60 && v.state !== "offline") store.live.set(k, { ...v, state: "offline" });
    }
  }
  return NextResponse.json({ buses: [...store.live.values()], demo: store.demo });
}
