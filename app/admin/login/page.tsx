import { redirect } from "next/navigation"; import LoginForm from "@/components/admin/LoginForm"; import AuthShell from "@/components/auth/AuthShell"; import { getAdmin } from "@/lib/auth";
export const metadata = { title: "Administrator sign-in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams }: { searchParams: { reason?: string } }) {
  if (await getAdmin()) redirect("/admin");
  return <AuthShell variant="admin">
    {searchParams.reason === "forbidden" && <p role="alert" className="notice notice-warn mb-4 max-w-sm">Please sign in with an administrator account to continue.</p>}
    <LoginForm /></AuthShell>;
}
