
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
