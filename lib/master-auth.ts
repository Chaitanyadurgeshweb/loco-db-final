import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

/** Signed-in user only if Auth verifies the session AND the database says they are a Master Admin (public.is_master_admin()). */
export async function getMaster() {
  const supabase = createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: ok, error: e2 } = await supabase.rpc("is_master_admin");
  if (e2 || ok !== true) return null;
  return { supabase, user };
}
export async function requireMaster() {
  const m = await getMaster();
  if (!m) redirect("/master/login?reason=forbidden");
  return m;
}
/** Only allow same-site Master Admin paths as post-login destinations. */
export function safeNext(v: unknown): string {
  const s = typeof v === "string" ? v : "";
  return /^\/master\/(?!login)[A-Za-z0-9/_\-?=&]*$/.test(s) && !s.includes("//") ? s : "/master";
}
