import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseEnv } from "../config";
import { DataAccessError } from "../data/errors";

export function createServiceClient() {
  const { url, service } = supabaseEnv();
  if (!url || !service) throw new DataAccessError("misconfigured");
  return createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function createAnonClient() {
  const { url, anon } = supabaseEnv();
  if (!url || !anon) throw new DataAccessError("misconfigured");
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function createSupabaseServer() {
  const { url, anon } = supabaseEnv();
  if (!url || !anon) throw new DataAccessError("misconfigured");
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot always write cookies. The proxy refreshes them.
        }
      },
    },
  });
}
