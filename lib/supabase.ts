import { createClient } from "@supabase/supabase-js";

// Client-side (anon key, RLS enforced). Never use service role here.
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

// Server-side privileged client for ingestion only (service role).
// Prototype note: falls back to demo in-memory store when env missing.
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("xyzcompany")) return null;
  return createClient(url, key);
}
