import Link from "next/link"; import { requireAdmin } from "@/lib/auth"; import { logout } from "../actions";
export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return <><div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-gray-300 bg-gray-50 px-4 py-2 mb-6 text-sm">
    <span className="font-semibold text-navy">Administration</span>
    <nav aria-label="Administration" className="flex flex-wrap gap-x-5 gap-y-1"><Link href="/admin">Dashboard</Link><Link href="/admin/locos">Locomotives</Link><Link href="/admin/locos/new">Add locomotive</Link><Link href="/admin/bulk">Bulk upload</Link><Link href="/">View public site</Link></nav>
    <form action={logout} className="ml-auto flex items-center gap-3"><span className="text-gray-700 break-all">{user.email}</span><button className="btn !py-1">Sign out</button></form></div>{children}</>;
}
