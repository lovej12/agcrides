"use client";
import { useMemo, useState } from "react";
import BusMap from "@/components/map";
import { useLiveBuses } from "@/components/use-live";
import { Card, Chip, EmptyState, Skeleton } from "@/components/ui";
import { ageLabel, isOffline } from "@/lib/utils";

const STOPS_R1 = [
  { name: "AGC Main Gate", lat: 31.577, lng: 74.982 },
  { name: "Verka Chowk", lat: 31.6512, lng: 74.8726 },
  { name: "Kathu Nangal", lat: 31.715, lng: 74.94 },
  { name: "Batala Bus Stand", lat: 31.8196, lng: 75.2028 }
];

export default function StudentPage() {
  const { buses, connected } = useLiveBuses();
  const [busIdx, setBusIdx] = useState(0);
  const [stopIdx, setStopIdx] = useState(1);
  const bus = buses[busIdx] ?? null;
  const myStop = STOPS_R1[stopIdx];

  const leave = useMemo(() => {
    if (!bus?.eta_min) return null;
    const walk = 8;
    const leaveIn = Math.max(0, bus.eta_min - walk);
    return { leaveIn, low: bus.eta_low, high: bus.eta_high };
  }, [bus]);

  const offline = bus ? isOffline(bus.last_seen) : true;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="px-4 pt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">When should I leave?</h1>
        {!connected && <Chip tone="warn">Reconnecting</Chip>}
      </div>

      <div className="mt-2">
        <BusMap buses={buses} myStop={myStop} />
      </div>

      <div className="px-4 -mt-6 relative">
        <Card className="rounded-[20px] shadow-lg">
          {buses.length === 0 ? (
            <>
              <Skeleton className="h-8 w-2/3" />
              <div className="mt-2 text-sm text-[#545454]">Waiting for live buses… simulator not running yet.</div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-[#545454]">{bus!.route_name}</div>
                  <div className="text-xl font-bold tabular">{bus!.bus_number}</div>
                </div>
                <Chip tone={offline ? "mute" : bus!.state === "moving" ? "go" : "warn"}>
                  {offline ? "Offline" : bus!.state}
                </Chip>
              </div>

              {leave ? (
                <div className="mt-3 p-3 rounded-[12px] bg-black text-white">
                  <div className="text-sm opacity-70">Pickup: {myStop.name}</div>
                  <div className="text-3xl font-bold tabular">Leave in {leave.leaveIn} min</div>
                  <div className="text-sm opacity-70 tabular">
                    Estimate {leave.low}–{leave.high} min · {ageLabel(bus!.last_seen)}
                  </div>
                </div>
              ) : (
                <EmptyState title="No live ETA" body="Bus is offline. Showing schedule, not live." />
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <label className="text-sm flex items-center gap-2 min-w-0 flex-1 basis-40">
                  Bus
                  <select
                    className="border rounded-[12px] px-2 py-2 min-h-[44px] min-w-0 flex-1"
                    value={busIdx}
                    onChange={(e) => setBusIdx(Number(e.target.value))}
                  >
                    {buses.map((b, i) => (
                      <option key={b.bus_id} value={i}>{b.bus_number}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm flex items-center gap-2 min-w-0 flex-1 basis-40">
                  My stop
                  <select
                    className="border rounded-[12px] px-2 py-2 min-h-[44px] min-w-0 flex-1"
                    value={stopIdx}
                    onChange={(e) => setStopIdx(Number(e.target.value))}
                  >
                    {STOPS_R1.map((s, i) => (
                      <option key={s.name} value={i}>{s.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <ol className="mt-4 border-l-2 border-black/10 ml-2 space-y-3">
                {STOPS_R1.map((s, i) => (
                  <li key={s.name} className="ml-3 relative">
                    <span
                      aria-hidden
                      className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${i < stopIdx ? "bg-[#06C167]" : i === stopIdx ? "bg-[#F5A100] animate-pulse" : "bg-black/20"}`}
                    />
                    <div className="text-[15px] font-medium">{s.name}</div>
                    <div className="text-[13px] text-[#545454] tabular">
                      {i === stopIdx && bus?.eta_min ? `ETA ${bus.eta_min} min · Estimate` : i < stopIdx ? "Passed" : "Upcoming"}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </Card>
        <p className="text-[13px] text-[#545454] mt-2 px-1">Times in IST. Offline if no update for 60 s. DEMO DATA when simulator drives.</p>
      </div>
    </div>
  );
}
