import { requireMaster } from "@/lib/master-auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import { createAdminAccount, changeAdminPassword, deleteAdminAccount } from "@/app/master/actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: {
    success?: string;
    error?: string;
  };
};

const errors: Record<string, string> = {
  invalid_username: "Username must be 3–32 characters.",
  invalid_email: "Enter a valid email address.",
  invalid_password: "Password must contain 12–128 characters.",
  username_exists: "This username is already registered.",
  database: "Unable to check the database.",
  auth_creation: "Account creation failed. The email may already exist.",
  role_assignment: "Unable to assign the Administrator role.",
  invalid_id: "That administrator could not be identified.",
  self: "You cannot change or delete your own account here.",
  protected: "Master Admin accounts cannot be changed here.",
  not_found: "That administrator no longer exists.",
  password_failed: "The password could not be changed. Please try again.",
  delete_failed: "The administrator could not be deleted. Nothing was changed.",
};

const successes: Record<string, string> = {
  created: "Administrator account created successfully.",
  password_changed: "Password changed. Share the new password with the administrator securely.",
  deleted: "Administrator deleted.",
  access_removed: "Administrator access removed. The account is kept because it has request history, but it can no longer sign in.",
};

export default async function AdminManagementPage({
  searchParams,
}: Props) {
  await requireMaster();

  const supabase = createServiceSupabase();

  const { data: admins, error } = await supabase
    .from("admin_users")
    .select("user_id, username, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Administrator listing error:", error);
  }

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Manage Administrators
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          Create administrators, change their passwords, or delete them.
        </p>
      </div>

      {/* Success message */}
      {searchParams.success && successes[searchParams.success] && (
        <div className="notice notice-ok" role="status">
          {successes[searchParams.success]}
        </div>
      )}

      {/* Error message */}
      {searchParams.error && (
        <div className="notice notice-error" role="alert">
          {errors[searchParams.error] ??
            "Something went wrong. Please try again."}
        </div>
      )}

      {/* Create administrator */}
      <section className="border rounded-lg bg-surface p-5">
        <h2 className="text-lg font-bold mb-5">
          Create New Administrator
        </h2>

        <form action={createAdminAccount} className="space-y-4">

          <div>
            <label htmlFor="username" className="label">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              className="input w-full"
              placeholder="Enter username"
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9._-]+"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className="input w-full"
              placeholder="administrator@example.com"
              maxLength={254}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Temporary Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              className="input w-full"
              placeholder="Minimum 12 characters"
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Create Administrator
          </button>

        </form>
      </section>

      {/* Existing administrators */}
      <section>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            Registered Administrators
          </h2>

          <span className="text-sm text-gray-600">
            Total: {admins?.length ?? 0}
          </span>
        </div>

        {error ? (
          <div className="notice notice-error">
            Unable to load administrators.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table w-full">

              <thead>
                <tr>
                  <th>Username</th>
                  <th>User ID</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {admins?.map((admin) => (
                  <tr key={admin.user_id}>
                    <td className="font-semibold">
                      {admin.username || "—"}
                    </td>

                    <td className="break-all text-xs">
                      {admin.user_id}
                    </td>

                    <td>
                      {new Date(
                        admin.created_at
                      ).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>

                    <td>
                      <div className="flex flex-col gap-2 min-w-[230px]">
                        <details>
                          <summary className="btn cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                            Change password
                          </summary>
                          <form action={changeAdminPassword} className="mt-2 space-y-2">
                            <input type="hidden" name="user_id" value={admin.user_id} />
                            <label htmlFor={`pw-${admin.user_id}`} className="label">
                              New password
                            </label>
                            <input
                              id={`pw-${admin.user_id}`}
                              name="password"
                              type="password"
                              className="input"
                              placeholder="Minimum 12 characters"
                              minLength={12}
                              maxLength={128}
                              autoComplete="new-password"
                              required
                            />
                            <button type="submit" className="btn btn-primary">
                              Save password
                            </button>
                          </form>
                        </details>

                        <details>
                          <summary className="btn btn-danger cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                            Delete
                          </summary>
                          <form action={deleteAdminAccount} className="mt-2 space-y-2">
                            <input type="hidden" name="user_id" value={admin.user_id} />
                            <p className="text-sm">
                              Delete <strong>{admin.username || "this administrator"}</strong>? This cannot be undone.
                            </p>
                            <button type="submit" className="btn btn-danger">
                              Yes, delete
                            </button>
                          </form>
                        </details>
                      </div>
                    </td>
                  </tr>
                ))}

                {(!admins || admins.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center py-6">
                      No administrators registered yet.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}
      </section>

    </div>
  );
}
