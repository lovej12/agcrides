"use client";
import { useEffect, useState } from "react";

export type LiveBus = {
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

/**
 * useLiveBuses: Supabase Realtime when configured, else polls /api/v1/live.
 * Never shows stale as live — caller uses isOffline(last_seen).
 */
export function useLiveBuses(pollMs = 10000) {
  const [buses, setBuses] = useState<LiveBus[]>([]);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const r = await fetch("/api/v1/live", { cache: "no-store" });
        if (!r.ok) throw new Error(`live ${r.status}`);
        const j = await r.json();
        if (!stop) {
          setBuses(j.buses ?? []);
          setConnected(true);
          setError(null);
        }
      } catch (e: any) {
        if (!stop) {
          setConnected(false);
          setError(e?.message ?? "offline");
        }
      }
    }
    load();
    const t = setInterval(load, pollMs);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [pollMs]);

  return { buses, connected, error };
}
