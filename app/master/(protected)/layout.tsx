
import Link from "next/link";
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

      <header className="bg-[#10243A] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4">

          <div className="flex items-center justify-between py-4">
            <Link href="/master" className="text-white no-underline">
              <h1 className="text-xl font-bold">
                LOCO PORTAL
              </h1>
              <p className="text-xs text-gray-300">
                Master Administration Panel
              </p>
            </Link>

            <form action={signOutMaster}>
              <button
                type="submit"
                className="border border-white/30 rounded-md px-4 py-2 hover:bg-white/10"
              >
                Sign Out
              </button>
            </form>
          </div>

          <nav className="flex flex-wrap gap-6 border-t border-white/20 py-3">

            <Link
              href="/master"
              className="text-white hover:text-blue-300 no-underline"
            >
              Approval Dashboard
            </Link>

            <Link
              href="/master/admins"
              className="text-white hover:text-blue-300 no-underline"
            >
              Manage Administrators
            </Link>

            <Link
              href="/"
              className="text-white hover:text-blue-300 no-underline"
            >
              View Public Site
            </Link>

          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="mt-10 border-t bg-white py-4 text-center text-xs text-gray-500">
        Loco Portal | Master Administration
      </footer>

    </div>
  );
}
