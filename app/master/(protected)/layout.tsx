
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireMaster } from "@/lib/master-auth";
import { signOutMaster } from "@/app/master/actions";

export const dynamic = "force-dynamic";

export default async function MasterProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireMaster();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Master Admin Header */}
      <header className="bg-[#10243A] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex flex-wrap items-center justify-between gap-4 py-4">

            {/* Logo and Title */}
            <Link
              href="/master"
              className="text-white no-underline"
            >
              <div className="text-xl font-bold tracking-wide">
                LOCO PORTAL
              </div>

              <div className="text-xs text-gray-300 mt-1">
                Master Administration Panel
              </div>
            </Link>

            {/* Logout */}
            <form action={signOutMaster}>
              <button
                type="submit"
                className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
              >
                Sign Out
              </button>
            </form>

          </div>

          {/* Navigation */}
          <nav
            aria-label="Master administration"
            className="flex flex-wrap gap-x-6 gap-y-3 border-t border-white/20 py-3"
          >
            <Link
              href="/master"
              className="text-sm font-medium text-white hover:text-blue-300 transition no-underline"
            >
              Approval Dashboard
            </Link>

            <Link
              href="/master/admins"
              className="text-sm font-medium text-white hover:text-blue-300 transition no-underline"
            >
              Manage Administrators
            </Link>

            <Link
              href="/"
              className="text-sm font-medium text-white hover:text-blue-300 transition no-underline"
            >
              View Public Site
            </Link>
          </nav>

        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-10">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-gray-500">
          Loco Portal | Master Administration
        </div>
      </footer>
    </div>
  );
}
