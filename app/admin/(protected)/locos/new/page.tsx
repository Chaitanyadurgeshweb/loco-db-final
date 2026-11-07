import Link from "next/link"; import { requireAdmin } from "@/lib/auth"; import { formOptions } from "@/lib/admin-data"; import PageHeader from "@/components/PageHeader"; import LocoForm from "@/components/admin/LocoForm"; import { createLoco } from "../actions";
export const metadata = { title: "Add locomotive" };
export default async function NewLoco() {
  const { supabase } = await requireAdmin(); const options = await formOptions(supabase);
  return <><PageHeader title="Add locomotive" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Locomotives", href: "/admin/locos" }, { label: "Add" }]}>
    <p>New records default to “Unverified”. Choose “Verified” only when you have checked a source. To add many locomotives at once, use <Link href="/admin/bulk">Bulk data upload</Link>.</p></PageHeader>
    <LocoForm mode="create" action={createLoco} options={options} initial={{ verification: "unverified" }} /></>;
}
