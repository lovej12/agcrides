#!/usr/bin/env node
// AGCRIDES sim-device.mjs — Node device simulator (BUS 01 + BUS 02).
// Reuses queue/retry/duplicate logic: point_id idempotent, retry never duplicates.
// Usage:
//   BUS_TOKEN=demo-token-BUS-01 node simulator/sim-device.mjs
//   Bad network: DROP_RATE=0.2 ACK_LOSS_RATE=0.1 LATENCY_MS=800 node simulator/sim-device.mjs
import crypto from "crypto";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const DROP = parseFloat(process.env.DROP_RATE || "0");
const ACK_LOSS = parseFloat(process.env.ACK_LOSS_RATE || "0");
const LAT = parseInt(process.env.LATENCY_MS || "0", 10);

const ROUTES = {
  "BUS 01": [
    [31.577, 74.982], [31.61, 74.93], [31.6512, 74.8726], [31.715, 74.94], [31.77, 75.12], [31.8196, 75.2028]
  ],
  "BUS 02": [
    [31.577, 74.982], [31.6105, 74.8801], [31.631, 74.865], [31.6338, 74.87], [31.6345, 74.86]
  ]
};

let queue = [];
let seq = 0;

function interp(route, t) {
  const n = route.length - 1;
  const f = Math.min(n - 0.001, t * n);
  const i = Math.floor(f);
  const k = f - i;
  const [a1, b1] = route[i];
  const [a2, b2] = route[i + 1];
  return [a1 + (a2 - a1) * k, b1 + (b2 - b1) * k];
}

async function post(batch, bus) {
  if (Math.random() < ACK_LOSS) throw new Error("ack lost (simulated)");
  await new Promise((r) => setTimeout(r, LAT));
  const token = process.env.BUS_TOKEN || `demo-token-${bus.replace(" ", "-")}`;
  const res = await fetch(`${BASE}/api/v1/positions/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ bus_id: bus, trip_id: `sim-${bus}`, points: batch })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loop() {
  let t = 0;
  console.log(`AGCRIDES sim → ${BASE} (drop=${DROP} ackLoss=${ACK_LOSS} lat=${LAT}ms)`);
  for (;;) {
    t += 0.02;
    for (const bus of Object.keys(ROUTES)) {
      const [lat, lng] = interp(ROUTES[bus], t % 1);
      const pt = {
        point_id: `sim-${bus}-${seq++}-${crypto.randomBytes(3).toString("hex")}`,
        lat: lat + (Math.random() - 0.5) * 0.0004,
        lng: lng + (Math.random() - 0.5) * 0.0004,
        speed_mps: 7,
        accuracy_m: 12,
        recorded_at: new Date().toISOString()
      };
      if (Math.random() >= DROP) queue.push({ ...pt, bus });
    }
    // upload per bus, 10 at a time
    for (const bus of Object.keys(ROUTES)) {
      const batch = queue.filter((q) => q.bus === bus).slice(0, 10).map(({ bus: _, ...p }) => p);
      if (!batch.length) continue;
      try {
        const r = await post(batch, bus);
        // delete only on 200 — retry never duplicates (point_id)
        queue = queue.filter((q) => !batch.some((b) => b.point_id === q.point_id));
        console.log(`${bus}: +${r.accepted} dup=${r.duplicates} q=${queue.length}`);
      } catch (e) {
        console.log(`${bus}: retry later (${e.message}) q=${queue.length}`);
      }
    }
    await new Promise((r) => setTimeout(r, 3000));
    if (t > 2) t = 0;
  }
}
loop();
