"use client";

import { getSupabase } from "./supabase";

// Base URL of the unified OceanLeo AI gateway. Overridable via env for local dev.
export const GATEWAY_BASE =
  process.env.NEXT_PUBLIC_OCEANLEO_GATEWAY_URL || "https://api.oceanleo.com";

export const SITE_ID = "bizdev";

async function authHeader(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Generic authed JSON helpers against the gateway. Feature code builds typed
// wrappers on top of these (see myselfie's lib/gateway.ts for the pattern).
export async function gatewayPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeader();
  const res = await fetch(`${GATEWAY_BASE}${path}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { detail?: string })?.detail || `HTTP ${res.status}`);
  }
  return data as T;
}

export async function gatewayGet<T>(path: string): Promise<T> {
  const headers = await authHeader();
  const res = await fetch(`${GATEWAY_BASE}${path}`, { headers, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { detail?: string })?.detail || `HTTP ${res.status}`);
  }
  return data as T;
}
