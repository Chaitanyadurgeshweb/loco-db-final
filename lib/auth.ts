import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

/** Returns the signed-in user only if the Auth server verifies the session AND the database says they are an admin (public.is_admin()). */
export async function getAdmin() {
  const supabase = createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();   // verified with Supabase Auth, not just decoded from the cookie
  if (error || !user) return null;
  const { data: ok, error: e2 } = await supabase.rpc("is_admin");
  if (e2 || ok !== true) return null;
  return { supabase, user };
}
/** For admin pages: redirect away unless an administrator. */
export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect("/admin/login?reason=forbidden");
  return a;
}
