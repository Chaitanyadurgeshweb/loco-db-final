
import { createServiceSupabase } from "@/lib/supabase/service";

export async function createAdminAccount(fd: FormData) {
  await requireMaster();

  const username = String(fd.get("username") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
    redirect("/master/admins?error=invalid_username");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/master/admins?error=invalid_email");
  }

  if (password.length < 12 || password.length > 128) {
    redirect("/master/admins?error=invalid_password");
  }

  const service = createServiceSupabase();

  // Check whether this username is already registered.
  const { data: existingUsername, error: usernameError } =
    await service
      .from("admin_users")
      .select("user_id")
      .ilike("username", username)
      .limit(1);

  if (usernameError) {
    console.error("Username check failed:", usernameError);
    redirect("/master/admins?error=database");
  }

  if (existingUsername && existingUsername.length > 0) {
    redirect("/master/admins?error=username_exists");
  }

  // Create the authentication account.
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error || !data.user) {
    console.error("Admin account creation failed:", error);
    redirect("/master/admins?error=auth_creation");
  }

  // Assign the new account the Administrator role.
  const { error: roleError } = await service
    .from("admin_users")
    .insert({
      user_id: data.user.id,
      username,
    });

  if (roleError) {
    console.error("Admin role assignment failed:", roleError);

    // Remove the Auth account if role assignment fails.
    await service.auth.admin.deleteUser(data.user.id);

    redirect("/master/admins?error=role_assignment");
  }

  revalidatePath("/master/admins");
  redirect("/master/admins?success=created");
}
