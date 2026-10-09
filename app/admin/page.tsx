"use client";
import { useEffect, useState } from "react";
import BusMap from "@/components/map";
import { useLiveBuses } from "@/components/use-live";
import { Button, Card, Chip } from "@/components/ui";
import { ageLabel } from "@/lib/utils";

export default function AdminPage() {
  const { buses } = useLiveBuses(5000);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [demo, setDemo] = useState(false);
  const [broadcast, setBroadcast] = useState("");

  async function loadAlerts() {
    try {
      const r = await fetch("/api/v1/alerts", { cache: "no-store" });
      const j = await r.json();
      setAlerts(j.alerts ?? []);
    } catch {}
  }
  useEffect(() => {
    loadAlerts();
    const t = setInterval(loadAlerts, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fleet control</h1>
        <Button onClick={async () => {
          const r = await fetch("/api/v1/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: !demo }) });
          const j = await r.json();
          setDemo(j.on);
        }}>{demo ? "Stop demo" : "Start demo"}</Button>
      </div>
      {demo && <Chip tone="warn">DEMO DATA — simulator driving BUS 01 + BUS 02</Chip>}

      <BusMap buses={buses} />

      <Card>
        <h2 className="font-semibold">Live fleet</h2>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#545454]"><th>Bus</th><th>Route</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>
              {buses.map((b) => (
                <tr key={b.bus_id} className="border-t">
                  <td className="py-2 font-semibold tabular">{b.bus_number}</td>
                  <td>{b.route_name}</td>
                  <td><Chip tone={b.state === "moving" ? "go" : b.state === "offline" ? "mute" : "warn"}>{b.state}</Chip></td>
                  <td className="tabular">{ageLabel(b.last_seen)}</td>
                </tr>
              ))}
              {!buses.length && <tr><td colSpan={4} className="py-4 text-[#545454]">No buses yet — start demo or run simulator.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Alerts</h2>
        <div className="space-y-2 mt-2">
          {alerts.map((a: any) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-[12px] p-2 text-sm">
              <span className="min-w-0"><b>{a.bus_id}</b> · {a.type} · {a.message}</span>
              <Button onClick={async () => { await fetch(`/api/v1/alerts?id=${a.id}`, { method: "DELETE" }); loadAlerts(); }}>Resolve</Button>
            </div>
          ))}
          {!alerts.length && <p className="text-sm text-[#545454]">No active alerts.</p>}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={async () => { await fetch("/api/v1/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bus_id: "BUS 01", type: "deviation", message: "Left route GT Road >150m" }) }); loadAlerts(); }}>Trigger deviation</Button>
          <Button onClick={async () => { await fetch("/api/v1/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bus_id: "BUS 02", type: "delay", message: "7 min late: traffic" }) }); loadAlerts(); }} className="!bg-white !text-black border">Trigger traffic delay</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Broadcast</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          <input value={broadcast} onChange={(e) => setBroadcast(e.target.value)} placeholder="Buses delayed due to rain…" className="flex-1 basis-48 min-w-0 border rounded-[12px] px-3 py-3 min-h-[44px]" />
          <Button onClick={async () => { await fetch("/api/v1/broadcasts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "AGC update", body: broadcast }) }); setBroadcast(""); alert("Broadcast sent (in-app MVP)"); }}>Send</Button>
        </div>
      </Card>
    </div>
  );
}
