import { redirect } from "next/navigation"; import AuthShell from "@/components/auth/AuthShell"; import AuthForm from "@/components/auth/AuthForm";
import { getMaster, safeNext } from "@/lib/master-auth"; import { masterLogin } from "../actions";
export const metadata = { title: "Master Admin sign-in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function MasterLogin({ searchParams }: { searchParams: { reason?: string; next?: string } }) {
  const next = safeNext(searchParams.next);
  if (await getMaster()) redirect(next);
  return <AuthShell variant="master">
    {searchParams.reason === "forbidden" && <p role="alert" className="notice notice-warn mb-4 max-w-sm">Please sign in with a Master Administrator account to continue.</p>}
    <AuthForm action={masterLogin} variant="master" next={next === "/master" ? undefined : next} /></AuthShell>;
}
