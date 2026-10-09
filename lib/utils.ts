import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Times stored UTC, displayed IST.
export function formatIST(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata"
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function ageSeconds(iso: string | null | undefined, now = Date.now()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((now - t) / 1000));
}

export function ageLabel(iso: string | null | undefined): string {
  const s = ageSeconds(iso);
  if (s === null) return "no data yet";
  if (s < 5) return "just now";
  return `updated ${s} s ago`;
}

export function isOffline(lastSeen: string | null | undefined, thresholdS = 60): boolean {
  const s = ageSeconds(lastSeen);
  if (s === null) return true;
  return s > thresholdS;
}
