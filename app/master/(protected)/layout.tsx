import { requireMaster } from "@/lib/master-auth";
import { signOutMaster } from "@/app/master/actions";

export const dynamic = "force-dynamic";

export default async function MasterProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireMaster();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
        <span className="badge badge-pending">Master Administration</span>
        <form action={signOutMaster} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 break-all">{user.email}</span>
          <button type="submit" className="btn">Sign out</button>
        </form>
      </div>
      {children}
    </>
  );
}
