import Link from "next/link"; import { requireAdmin } from "@/lib/auth"; import PageHeader from "@/components/PageHeader"; import { ArchivedBadge } from "@/components/Badge"; import { formatDate } from "@/lib/format";
export const metadata = { title: "Admin dashboard" };
export default async function Dashboard() {
  const { supabase: sb } = await requireAdmin();
  const count = (t: string, f?: (q: any) => any) => { const q = sb.from(t).select("*", { count: "exact", head: true }); return (f ? f(q) : q).then((r: any) => r.count as number | null); };
  const [loco, arch, cls, shd, zon, mfr, recent] = await Promise.all([count("locomotives"), count("locomotives", q => q.eq("archived", true)), count("loco_classes"), count("sheds"), count("zones"), count("manufacturers"),
    sb.from("locomotives").select("number,archived,updated_at,loco_classes(code)").order("updated_at", { ascending: false }).limit(10)]);
  const stats: [string, number | null][] = [["Locomotives (all)", loco], ["Archived locomotives", arch], ["Classes", cls], ["Sheds", shd], ["Zones", zon], ["Manufacturers", mfr]];
  const rows = (recent.data ?? []) as any[];
  return <><PageHeader title="Administration" crumbs={[{ label: "Admin" }]}><p>Counts below come live from the database. Changes you submit are reviewed before they appear on the live records.</p></PageHeader>
    <dl className="grid grid-cols-2 md:grid-cols-6 border border-gray-200 divide-x divide-gray-200 text-center mb-6">
      {stats.map(([l, v]) => <div key={l} className="py-3 px-2"><dd className="text-2xl font-bold text-navy tabular-nums">{v === null ? "—" : v.toLocaleString()}</dd><dt className="text-xs text-gray-700">{l}</dt></div>)}</dl>
    <p className="flex flex-wrap gap-3"><Link href="/admin/locos/new" className="btn btn-primary">Add locomotive</Link><Link href="/admin/bulk" className="btn">Bulk data upload</Link><Link href="/admin/locos" className="btn">Manage locomotives</Link></p>
    <h2>Recently updated records</h2>
    {recent.error ? <p role="alert" className="notice notice-error">Could not load recent records.</p> : rows.length === 0 ? <p className="notice">No records yet.</p> :
    <div className="table-wrap max-w-2xl"><table className="data-table"><thead><tr><th scope="col" className="num">Number</th><th scope="col">Class</th><th scope="col">Updated</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Action</span></th></tr></thead><tbody>
      {rows.map(r => <tr key={r.number}><td className="num">{r.number}</td><td>{r.loco_classes?.code ?? "—"}</td><td className="num">{formatDate(r.updated_at)}</td><td>{r.archived ? <ArchivedBadge /> : "Listed"}</td><td><Link href={`/admin/locos/${r.number}/edit`}>Edit</Link></td></tr>)}</tbody></table></div>}</>;
}
