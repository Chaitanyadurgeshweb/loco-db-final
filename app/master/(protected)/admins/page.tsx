
import { requireMaster } from "@/lib/master-auth";
import { createServiceSupabase } from "@/lib/supabase/service";
import { createAdminAccount } from "@/app/master/actions";

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
          Create and view Administrator accounts for Loco Portal.
        </p>
      </div>

      {/* Success message */}
      {searchParams.success === "created" && (
        <div className="notice notice-ok">
          Administrator account created successfully.
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
                  </tr>
                ))}

                {(!admins || admins.length === 0) && (
                  <tr>
                    <td colSpan={3} className="text-center py-6">
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
