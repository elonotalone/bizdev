"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

// OceanLeo shared identity — cross-subdomain SSO via a cookie scoped to
// .oceanleo.com. One login on ANY *.oceanleo.com site signs you into ALL of
// them. Delegates to the centralized client in lib/oceanleo-auth/* so every
// site shares the exact same cookie config (no split-brain). See
// docs/architecture/oceanleo-cross-subdomain-sso.md (oceandino repo).
import { browserClient, oceanleoConfigured } from "@/lib/oceanleo-auth";

export function getSupabase(): SupabaseClient | null {
  return browserClient();
}

export function supabaseConfigured(): boolean {
  return oceanleoConfigured();
}
