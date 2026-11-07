import Link from "next/link"; import { requireMaster } from "@/lib/master-auth"; import { masterLogout } from "../actions";
export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireMaster();
  return <><div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-gray-900 text-white px-4 py-2 mb-6 text-sm rounded-sm border-l-4 border-rail">
    <span className="font-semibold">Master Administration</span>
    <nav aria-label="Master administration" className="flex flex-wrap gap-x-5 gap-y-1"><Link href="/master" className="!text-white">Approval dashboard</Link><Link href="/" className="!text-white">View public site</Link></nav>
    <form action={masterLogout} className="ml-auto flex items-center gap-3"><span className="text-gray-300 break-all">{user.email}</span><button className="btn !py-1 !bg-transparent !text-white !border-gray-500 hover:!bg-white/10">Sign out</button></form></div>{children}</>;
}
