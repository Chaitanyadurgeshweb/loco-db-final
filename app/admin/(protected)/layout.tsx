import { requireAdmin } from "@/lib/auth"; import { logout } from "../actions";
export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return <><div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
    <span className="badge badge-source_listed">Administration</span>
    <form action={logout} className="flex items-center gap-3"><span className="text-sm text-gray-600 break-all">{user.email}</span><button className="btn">Sign out</button></form></div>{children}</>;
}
