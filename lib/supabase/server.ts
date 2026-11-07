import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Session cookies are only ever read on the server, so make them httpOnly. */
export function hardenCookie(o: CookieOptions): CookieOptions {
  return { ...o, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" };
}
/** Per-request Supabase client acting AS THE SIGNED-IN USER (anon key + session cookie). RLS applies to everything it does. */
export function createServerSupabase() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set (see .env.example)");
  const store = cookies();
  return createServerClient(url, key, { cookies: {
    getAll: () => store.getAll(),
    setAll(list) { try { list.forEach(({ name, value, options }) => store.set(name, value, hardenCookie(options))); } catch { /* called from a Server Component: middleware refreshes the session */ } },
  } });
}
