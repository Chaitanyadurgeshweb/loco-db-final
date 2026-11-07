import { notFound } from "next/navigation"; import { requireAdmin } from "@/lib/auth"; import { formOptions } from "@/lib/admin-data"; import PageHeader from "@/components/PageHeader";
import LocoForm from "@/components/admin/LocoForm"; import { ArchivedBadge } from "@/components/Badge"; import { formatDate } from "@/lib/format"; import { updateLoco } from "../../actions"; import Discussion from "@/components/admin/Discussion";
export const metadata = { title: "Edit locomotive" };
export default async function EditLoco({ params }: { params: { number: string } }) {
  if (!/^\d{5}$/.test(params.number)) notFound();
  const { supabase } = await requireAdmin();
  const [options, { data: r, error }] = await Promise.all([formOptions(supabase),
    supabase.from("locomotives").select("number,class_id,shed_id,zone_id,manufacturer_id,kavach_make,service_status,verification,last_verified,archived,created_at,updated_at").eq("number", Number(params.number)).maybeSingle()]);
  if (error) return <p role="alert" className="notice notice-error">Could not load this record. Please try again.</p>;
  if (!r) notFound();
  const initial: Record<string, string> = { number: String(r.number), class_id: String(r.class_id), shed_id: String(r.shed_id), zone_id: String(r.zone_id), manufacturer_id: r.manufacturer_id ? String(r.manufacturer_id) : "",
    kavach_make: r.kavach_make ?? "", service_status: r.service_status ?? "", verification: r.verification, last_verified: r.last_verified ?? "", archived: r.archived ? "on" : "" };
  return <><PageHeader title={`Edit locomotive ${r.number}`} crumbs={[{ label: "Admin", href: "/admin" }, { label: "Locomotives", href: "/admin/locos" }, { label: String(r.number) }]}>
    <p>Created {formatDate(r.created_at)} · last updated {formatDate(r.updated_at)} {r.archived && <ArchivedBadge />}</p><p className="text-sm mt-1">Changes you submit here are recorded as requests. This page always shows the current record.</p></PageHeader>
    <LocoForm mode="edit" action={updateLoco} options={options} initial={initial} /><Discussion sb={supabase} number={r.number} /></>;
}
