"use client";
import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";

// Entry gate: pick the interface for this device. Remembered per device.
export default function Home() {
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    setSaved(localStorage.getItem("agc-device"));
  }, []);

  function pick(device: "phone" | "laptop", href: string) {
    localStorage.setItem("agc-device", device);
    window.location.href = href;
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-10 text-center">
      <img src="/logo.svg" alt="AGCRIDES logo" width={72} height={72} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">AGCRIDES</h1>
      <p className="mt-1 text-[#545454]">Amritsar Group of Colleges bus tracking</p>

      {saved && (
        <p className="mt-3 text-sm">
          Last time you used {saved === "phone" ? "phone" : "laptop"}.{" "}
          <a className="underline" href={saved === "phone" ? "/student" : "/admin"}>Continue</a>
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        <Card className="rounded-[20px] text-left p-5">
          <h2 className="font-semibold text-lg">Phone</h2>
          <p className="text-sm text-[#545454] mt-1">Mobile interface. For students catching the bus and drivers sharing GPS.</p>
          <div className="mt-4 grid gap-2">
            <Button onClick={() => pick("phone", "/student")}>I am a student</Button>
            <Button onClick={() => pick("phone", "/driver")} className="!bg-white !text-black border">I am a driver</Button>
          </div>
        </Card>
        <Card className="rounded-[20px] text-left p-5">
          <h2 className="font-semibold text-lg">Laptop</h2>
          <p className="text-sm text-[#545454] mt-1">Browser control room. Live fleet, alerts, and broadcasts for admins.</p>
          <div className="mt-4">
            <Button onClick={() => pick("laptop", "/admin")} className="w-full">Open admin</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
