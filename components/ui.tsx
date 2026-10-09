import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center rounded-[12px] bg-black text-white dark:bg-white dark:text-black",
        "px-5 min-h-[44px] text-[15px] font-semibold active:translate-y-px disabled:opacity-50",
        className
      )}
    />
  );
}

export function Chip({ children, tone = "mute" }: { children: React.ReactNode; tone?: "go" | "warn" | "alert" | "mute" }) {
  const map: Record<string, string> = {
    go: "bg-[#06C167]/15 text-[#0d7a43]",
    warn: "bg-[#C77700]/15 text-[#8a5200]",
    alert: "bg-[#D64545]/15 text-[#a02c2c]",
    mute: "bg-black/5 text-[#545454]"
  };
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium", map[tone])}>
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("bg-[var(--color-card)] border rounded-[12px] p-4 shadow-sm", className)}>{children}</section>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse bg-black/10 rounded-[12px] min-h-[20px]", className)} />;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-10 px-6">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-[#545454] mt-1 text-[15px]">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
