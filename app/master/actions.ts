
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import { createServiceSupabase } from "@/lib/supabase/service";
import { requireMaster, safeNext } from "@/lib/master-auth";
import type { FormState } from "@/lib/loco-schema";

// --------------------------------------------------
// MASTER ADMIN LOGIN
// --------------------------------------------------

export async function masterLogin(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = safeNext(fd.get("next"));

  const fieldErrors: Record<string, string> = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!password || password.length > 200) {
    fieldErrors.password = "Enter your password.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      fieldErrors,
      values: { email },
    };
  }

  const supabase = createServerSupabase();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: "Sign-in failed. Check your email and password.",
      values: { email },
    };
  }

  const { data: isMaster, error: roleError } =
    await supabase.rpc("is_master_admin");

  if (roleError || isMaster !== true) {
    await supabase.auth.signOut();

    return {
      status: "error",
      message: "This account is not authorised as a Master Admin.",
      values: { email },
    };
  }

  redirect(next);
}

// --------------------------------------------------
// MASTER ADMIN LOGOUT
// --------------------------------------------------

export async function signOutMaster() {
  const supabase = createServerSupabase();

  await supabase.auth.signOut();

  redirect("/master/login");
}

// --------------------------------------------------
// CREATE ADMINISTRATOR ACCOUNT
// --------------------------------------------------

export async function createAdminAccount(fd: FormData) {
  await requireMaster();

  const username = String(fd.get("username") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
    redirect("/master/admins?error=invalid_username");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    redirect("/master/admins?error=invalid_email");
  }

  if (password.length < 12 || password.length > 128) {
    redirect("/master/admins?error=invalid_password");
  }

  const service = createServiceSupabase();

  // Check duplicate username.
  const { data: existing, error: checkError } = await service
    .from("admin_users")
    .select("user_id")
    .ilike("username", username)
    .limit(1);

  if (checkError) {
    console.error("Username check failed:", checkError);
    redirect("/master/admins?error=database");
  }

  if (existing && existing.length > 0) {
    redirect("/master/admins?error=username_exists");
  }

  // Create Supabase Authentication account.
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error || !data.user) {
    console.error("Authentication account creation failed:", error);
    redirect("/master/admins?error=auth_creation");
  }

  // Assign Administrator role.
  const { error: roleError } = await service
    .from("admin_users")
    .insert({
      user_id: data.user.id,
      username,
    });

  if (roleError) {
    console.error("Administrator role assignment failed:", roleError);

    await service.auth.admin.deleteUser(data.user.id);

    redirect("/master/admins?error=role_assignment");
  }

  revalidatePath("/master/admins");

  redirect("/master/admins?success=created");
}

// --------------------------------------------------
// CHANGE PASSWORD / DELETE ADMINISTRATOR
// --------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Checks the target is a real Administrator: never yourself, never a Master Admin. */
async function loadTargetAdmin(fd: FormData, selfId: string) {
  const id = String(fd.get("user_id") ?? "").trim().toLowerCase();

  if (!UUID.test(id)) redirect("/master/admins?error=invalid_id");
  if (id === selfId) redirect("/master/admins?error=self");

  const service = createServiceSupabase();

  const { data: master, error: masterError } = await service
    .from("master_admins")
    .select("user_id")
    .eq("user_id", id)
    .maybeSingle();

  if (masterError) {
    console.error("Master check failed:", masterError);
    redirect("/master/admins?error=database");
  }
  if (master) redirect("/master/admins?error=protected");

  const { data: admin, error: adminError } = await service
    .from("admin_users")
    .select("user_id")
    .eq("user_id", id)
    .maybeSingle();

  if (adminError) {
    console.error("Administrator lookup failed:", adminError);
    redirect("/master/admins?error=database");
  }
  if (!admin) redirect("/master/admins?error=not_found");

  return { service, id };
}

export async function changeAdminPassword(fd: FormData) {
  const { user } = await requireMaster();

  const password = String(fd.get("password") ?? "");
  if (password.length < 12 || password.length > 128) {
    redirect("/master/admins?error=invalid_password");
  }

  const { service, id } = await loadTargetAdmin(fd, user.id);

  const { error } = await service.auth.admin.updateUserById(id, { password });

  if (error) {
    console.error("Password change failed:", error);
    redirect("/master/admins?error=password_failed");
  }

  revalidatePath("/master/admins");
  redirect("/master/admins?success=password_changed");
}

export async function deleteAdminAccount(fd: FormData) {
  const { user } = await requireMaster();
  const { service, id } = await loadTargetAdmin(fd, user.id);

  // 1. Remove the Administrator role first, so access ends immediately.
  const { error: roleError } = await service
    .from("admin_users")
    .delete()
    .eq("user_id", id);

  if (roleError) {
    console.error("Administrator role removal failed:", roleError);
    redirect("/master/admins?error=delete_failed");
  }

  // 2. Delete the sign-in account.
  const { error: deleteError } = await service.auth.admin.deleteUser(id);

  if (deleteError) {
    // The account has submitted or reviewed requests, which must stay in the audit history.
    // Keep the account but block it from signing in.
    console.error("Account deletion blocked, banning instead:", deleteError);

    const { error: banError } = await service.auth.admin.updateUserById(id, {
      ban_duration: "876000h",
    });

    if (banError) console.error("Ban failed:", banError);

    revalidatePath("/master/admins");
    redirect("/master/admins?success=access_removed");
  }

  revalidatePath("/master/admins");
  redirect("/master/admins?success=deleted");
}

// --------------------------------------------------
// APPROVE / DECLINE CHANGE REQUESTS (restored)
// --------------------------------------------------

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
