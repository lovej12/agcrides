import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGCRIDES — AGC campus bus tracking",
  description: "When to leave to catch your AGC bus. Live map, ETA, driver and admin.",
  manifest: "/manifest.webmanifest",
  themeColor: "#000000"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:p-2 focus:bg-black focus:text-white">
          Skip to content
        </a>
        <header className="sticky top-0 z-40 bg-[var(--color-paper)] border-b">
          <nav className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto" aria-label="Roles">
            <a href="/" className="flex items-center gap-2 font-semibold tracking-tight text-lg min-h-[44px]">
              <img src="/logo.svg" alt="" width={28} height={28} aria-hidden />
              AGCRIDES
            </a>
            <div className="hidden sm:flex gap-1 text-sm">
              <a className="px-3 py-2 rounded-[12px] min-h-[44px] inline-flex items-center hover:bg-black/5" href="/student">Student</a>
              <a className="px-3 py-2 rounded-[12px] min-h-[44px] inline-flex items-center hover:bg-black/5" href="/driver">Driver</a>
              <a className="px-3 py-2 rounded-[12px] min-h-[44px] inline-flex items-center hover:bg-black/5" href="/admin">Admin</a>
            </div>
          </nav>
        </header>
        <main id="main" className="pb-nav">{children}</main>
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-paper)] border-t" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Primary">
          <div className="grid grid-cols-3 max-w-3xl mx-auto">
            <a href="/student" className="py-3 min-h-[44px] text-center text-sm font-medium">Student</a>
            <a href="/driver" className="py-3 min-h-[44px] text-center text-sm font-medium">Driver</a>
            <a href="/admin" className="py-3 min-h-[44px] text-center text-sm font-medium">Admin</a>
          </div>
        </nav>
      </body>
    </html>
  );
}
