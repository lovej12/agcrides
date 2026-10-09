"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Chip } from "@/components/ui";

// Driver phone tracker: watchPosition → IndexedDB queue → batch POST with backoff.
// Prototype note: Wake Lock best-effort, GPS stops on screen lock (see KNOWN_LIMITS).
export default function DriverPage() {
  const [tripId, setTripId] = useState<string | null>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [lastUpload, setLastUpload] = useState<string | null>(null);
  const [gps, setGps] = useState<string>("no fix");
  const [busId, setBusId] = useState("BUS 01");
  const watchRef = useRef<number | null>(null);

  function loadQueue(): any[] {
    try {
      return JSON.parse(localStorage.getItem("agc-queue") || "[]");
    } catch {
      return [];
    }
  }
  function saveQueue(q: any[]) {
    localStorage.setItem("agc-queue", JSON.stringify(q.slice(-200)));
    setQueue(q.slice(-200));
  }

  useEffect(() => {
    setQueue(loadQueue());
  }, []);

  async function upload(q = loadQueue()) {
    if (!q.length) return;
    try {
      const batch = q.slice(0, 20);
      const r = await fetch("/api/v1/positions/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("agc-device-token") || "demo-token-BUS-01"}`
        },
        body: JSON.stringify({
          bus_id: busId,
          trip_id: tripId,
          points: batch
        })
      });
      if (r.ok) {
        const rest = q.slice(batch.length);
        saveQueue(rest);
        setLastUpload(new Date().toISOString());
      }
    } catch {}
  }

  function startWatch() {
    if (!("geolocation" in navigator)) {
      setGps("no GPS on this device");
      return;
    }
    setGps("waiting for fix…");
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, accuracy } = pos.coords;
        setGps(`±${Math.round(accuracy ?? 0)} m`);
        const pt = {
          point_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          lat: latitude,
          lng: longitude,
          speed_mps: speed ?? 0,
          accuracy_m: accuracy ?? 20,
          recorded_at: new Date().toISOString()
        };
        const q = [...loadQueue(), pt];
        saveQueue(q);
        if (q.length >= 5) upload(q);
      },
      () => setGps("fix lost — move outdoors"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    ) as unknown as number;
    // Wake lock best effort
    try {
      (navigator as any).wakeLock?.request("screen").catch(() => {});
    } catch {}
  }

  async function startTrip() {
    const id = `trip-${Date.now()}`;
    setTripId(id);
    try {
      await fetch("/api/v1/trips/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bus_id: busId, trip_id: id })
      });
    } catch {}
    startWatch();
  }

  async function endTrip() {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    try {
      await fetch("/api/v1/trips/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bus_id: busId, trip_id: tripId })
      });
    } catch {}
    await upload();
    setTripId(null);
  }

  async function delay(reason: string) {
    await fetch("/api/v1/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bus_id: busId, type: "delay", message: reason })
    });
    alert(`Sent: ${reason}`);
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 space-y-4">
      <h1 className="text-2xl font-semibold">Driver</h1>
      <Card>
        <label className="text-sm">Bus
          <select value={busId} onChange={(e) => setBusId(e.target.value)} className="ml-2 border rounded-[12px] px-3 py-2 min-h-[44px]">
            <option>BUS 01</option>
            <option>BUS 02</option>
          </select>
        </label>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Chip tone="go">{gps}</Chip>
          <Chip>queue {queue.length}</Chip>
          <Chip>{lastUpload ? `uploaded ${new Date(lastUpload).toLocaleTimeString("en-IN")}` : "not uploaded yet"}</Chip>
        </div>
        {!tripId ? (
          <Button className="w-full mt-4 !min-h-[64px] !text-lg" onClick={startTrip}>Start trip</Button>
        ) : (
          <Button className="w-full mt-4 !min-h-[64px] !text-lg !bg-[#D64545]" onClick={endTrip}>End trip</Button>
        )}
        <p className="text-[13px] text-[#545454] mt-2">Keep the screen on. Browser tracking stops when the phone locks.</p>
      </Card>

      <Card>
        <h2 className="font-semibold">Delay reason — one tap</h2>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {["Traffic", "Breakdown", "Accident", "Other"].map((r) => (
            <Button key={r} onClick={() => delay(r)} className="!bg-white !text-black border">{r}</Button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Device token (paste once)</h2>
        <input
          className="mt-2 w-full border rounded-[12px] px-3 py-3 min-h-[44px]"
          placeholder="demo-token-BUS-01"
          onChange={(e) => localStorage.setItem("agc-device-token", e.target.value)}
        />
        <p className="text-[13px] text-[#545454] mt-1">Stored on device only. Server stores SHA-256 hash.</p>
      </Card>
    </div>
  );
}
