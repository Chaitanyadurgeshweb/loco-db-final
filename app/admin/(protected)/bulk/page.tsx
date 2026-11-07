import Link from "next/link"; import { requireAdmin } from "@/lib/auth"; import PageHeader from "@/components/PageHeader"; import BulkUpload from "@/components/admin/BulkUpload";
export const metadata = { title: "Bulk data upload" };
export default async function BulkPage() {
  await requireAdmin();
  return <><PageHeader title="Bulk data upload" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Bulk data upload" }]}>
    <p>Upload an Excel workbook of locomotives. New locomotives are added; for locomotives that already exist, only <b>empty</b> fields are filled and nothing populated is overwritten. Review the summary, then submit.</p>
    <p className="mt-2"><a href="/admin/bulk/template" className="btn">Download template</a> <Link href="/admin/locos/new" className="ml-3 text-sm">Add a single locomotive instead</Link></p></PageHeader>
  <BulkUpload /></>;
}
