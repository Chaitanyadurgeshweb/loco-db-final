"use server";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { FormState } from "@/lib/loco-schema";

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase(), password = String(fd.get("password") ?? "");
  const fieldErrors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fieldErrors.email = "Enter a valid email address.";
  if (!password || password.length > 200) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors, values: { email } };
  const supabase = createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "Sign-in failed. Check your email and password.", values: { email } };
  const { data: ok } = await supabase.rpc("is_admin");              // authentication is not authorisation
  if (ok !== true) { await supabase.auth.signOut(); return { status: "error", message: "This account is not authorised to use the administration area.", values: { email } }; }
  redirect("/admin");
}

export async function logout() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
