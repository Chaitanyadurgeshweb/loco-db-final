
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
    <div className="min-h-screen bg-white">

      {/* Existing Public Website Header */}
      <header className="bg-[#14213d] text-white">
        <div className="mx-auto max-w-[1100px] px-4">

          <div className="flex flex-wrap items-center justify-between gap-4 py-4">

            <Link href="/" className="text-white no-underline">
              <div className="text-lg font-bold">
                LOCO PORTAL
              </div>

              <p className="text-xs text-blue-100">
                Independent Indian Railways locomotive reference
              </p>
            </Link>

            <form action="/" className="flex gap-2">
              <input
                type="search"
                name="q"
                placeholder="Loco no., class or shed"
                className="w-64 rounded px-3 py-2 text-sm text-gray-900 outline-none"
              />

              <button
                type="submit"
                className="rounded bg-[#963e2e] px-5 py-2 text-sm font-semibold text-white"
              >
                Search
              </button>
            </form>

          </div>

        </div>

        <div className="border-t border-white/20 bg-[#1b2c4d]">
          <nav className="mx-auto flex max-w-[1100px] flex-wrap gap-6 px-4 py-3 text-sm">
            <Link href="/" className="text-white no-underline">Home</Link>
            <Link href="/locomotives" className="text-white no-underline">Locomotives</Link>
            <Link href="/classes" className="text-white no-underline">Classes</Link>
            <Link href="/sheds" className="text-white no-underline">Sheds</Link>
            <Link href="/zones" className="text-white no-underline">Zones</Link>
            <Link href="/manufacturers" className="text-white no-underline">Manufacturers</Link>
            <Link href="/data-status" className="text-white no-underline">Data status</Link>
            <Link href="/about" className="text-white no-underline">About</Link>
          </nav>
        </div>
      </header>

      {/* Master Admin Navigation */}
      <div className="mx-auto max-w-[1100px] px-4 pt-8">

        <div className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-[#963e2e] bg-[#111827] px-4 py-2">

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

            <span className="text-sm font-bold text-white">
              Master Administration
            </span>

            <Link
              href="/master"
              className="text-sm text-white no-underline hover:text-blue-300"
            >
              Approval dashboard
            </Link>

            <Link
              href="/master/admins"
              className="text-sm font-semibold text-white no-underline hover:text-blue-300"
            >
              Manage Administrators
            </Link>

            <Link
              href="/"
              className="text-sm text-white no-underline hover:text-blue-300"
            >
              View public site
            </Link>

          </div>

          <div className="flex items-center gap-3">

            <span className="hidden text-xs text-gray-200 sm:block">
              Master Admin
            </span>

            <form action={signOutMaster}>
              <button
                type="submit"
                className="rounded border border-gray-400 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                Sign out
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* Page Content */}
      <main className="mx-auto max-w-[1100px] px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-10 max-w-[1100px] border-t border-gray-200 px-4 py-5 text-center text-xs text-gray-500">
        LOCO PORTAL | Master Administration
      </footer>

    </div>
  );
}
DD
