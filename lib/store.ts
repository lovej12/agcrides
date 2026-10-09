// In-memory fallback store (used when Supabase env missing — local/demo).
// Production uses Supabase; shape matches DB tables. Prototype: resets on redeploy.
import crypto from "crypto";

export type Pt = {
  point_id: string;
  bus_id: string;
  trip_id?: string | null;
  lat: number;
  lng: number;
  speed_mps: number;
  accuracy_m: number;
  recorded_at: string;
  received_at: string;
};

export type Live = {
  bus_id: string;
  bus_number: string;
  route_name: string;
  lat: number;
  lng: number;
  speed_mps: number;
  last_seen: string;
  state: "moving" | "stopped" | "offline";
  eta_min: number | null;
  eta_low: number | null;
  eta_high: number | null;
  next_stop: string | null;
};

const g = globalThis as any;
g.__agc = g.__agc || {
  points: new Map<string, Pt>(),
  live: new Map<string, Live>([
    ["BUS 01", { bus_id: "BUS 01", bus_number: "BUS 01", route_name: "AGC → Batala", lat: 31.6, lng: 74.93, speed_mps: 0, last_seen: new Date(0).toISOString(), state: "offline", eta_min: null, eta_low: null, eta_high: null, next_stop: "Verka Chowk" }],
    ["BUS 02", { bus_id: "BUS 02", bus_number: "BUS 02", route_name: "AGC → Hall Gate", lat: 31.6, lng: 74.9, speed_mps: 0, last_seen: new Date(0).toISOString(), state: "offline", eta_min: null, eta_low: null, eta_high: null, next_stop: "Celebration Mall" }]
  ]),
  alerts: [] as any[],
  trips: new Map(),
  demo: false,
  demoT: 0
};

export const store = g.__agc as {
  points: Map<string, Pt>;
  live: Map<string, Live>;
  alerts: any[];
  trips: Map<string, any>;
  demo: boolean;
  demoT: number;
};

export function hashToken(t: string): string {
  return crypto.createHash("sha256").update(t).digest("hex");
}

// ETA engine (server): rolling avg speed clamped, segment blend stub, low/exp/high.
export function computeEta(distKm: number, speedMps: number): { low: number; exp: number; high: number } {
  const v = Math.max(3, Math.min(speedMps || 6, 14)); // clamp 3..14 m/s
  const mins = (distKm * 1000) / v / 60;
  return { low: Math.max(1, Math.round(mins * 0.85)), exp: Math.round(mins), high: Math.round(mins * 1.25) + 1 };
}
