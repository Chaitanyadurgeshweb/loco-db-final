"use server";
import { redirect } from "next/navigation"; import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server"; import { requireMaster, safeNext } from "@/lib/master-auth"; import type { FormState } from "@/lib/loco-schema";

export async function masterLogin(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase(), password = String(fd.get("password") ?? "");
  const fieldErrors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fieldErrors.email = "Enter a valid email address.";
  if (!password || password.length > 200) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors, values: { email } };
  const supabase = createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "Sign-in failed. Check your email and password.", values: { email } };
  const { data: ok } = await supabase.rpc("is_master_admin");        // authentication is not authorisation
  if (ok !== true) { await supabase.auth.signOut(); return { status: "error", message: "This account is not authorised for the Master Admin area.", values: { email } }; }
  redirect(safeNext(fd.get("next")));
}
export async function masterLogout() { await createServerSupabase().auth.signOut(); redirect("/master/login"); }

const REVIEW_ERRORS: Record<string, string> = { ALREADY_REVIEWED: "This request has already been reviewed.", OWN_REQUEST: "You cannot review a request that you submitted.", NOT_AUTHORISED: "You are not authorised to review requests." };
/** Approve or decline. The database function re-checks the role, locks the row, blocks self-review and applies the data atomically. */
export async function reviewRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireMaster();
  const id = Number(fd.get("id")), decision = String(fd.get("decision")), reason = String(fd.get("reason") ?? "").trim();
  if (!Number.isInteger(id) || id < 1 || !["approve", "decline"].includes(decision)) return { status: "error", message: "Invalid request." };
  if (decision === "decline" && reason.length < 3) return { status: "error", message: "Enter a reason for declining.", fieldErrors: { reason: "A reason is required." }, values: { reason } };
  const { data, error } = await supabase.rpc("review_change_request", { p_id: id, p_decision: decision, p_reason: decision === "decline" ? reason : null });
  revalidatePath("/master"); revalidatePath(`/master/requests/${id}`);
  if (error) {
    console.error("review_change_request", error.code, error.message);
    const m = error.message ?? "";
    const known = Object.keys(REVIEW_ERRORS).find(k => m.includes(k)); if (known) return { status: "error", message: REVIEW_ERRORS[known] };
    const c = /CONFLICT: (.+)/.exec(m); if (c) return { status: "error", message: `Cannot approve: ${c[1]}. Nothing was changed; you may decline this request.` };
    return { status: "error", message: "The decision could not be recorded. Nothing was changed. Please try again." };
  }
  return { status: "success", message: data?.status === "approved" ? `Approved. ${data.applied} locomotive record(s) updated.` : "Declined. No live data was changed." };
}
