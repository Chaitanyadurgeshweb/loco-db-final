import Link from "next/link"; import { requireAdmin } from "@/lib/auth"; import { adminSearch, formOptions } from "@/lib/admin-data";
import PageHeader from "@/components/PageHeader"; import Pager from "@/components/Pager"; import { VerificationBadge, ArchivedBadge } from "@/components/Badge"; import { formatDate } from "@/lib/format";
export const metadata = { title: "Manage locomotives" };
type SP = { q?: string; cls?: string; zone?: string; shed?: string; mfr?: string; state?: string; page?: string };
export default async function AdminLocos({ searchParams: sp }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const o = await formOptions(supabase);
  const state: "active" | "archived" | undefined = sp.state === "active" || sp.state === "archived" ? sp.state : undefined;
  const f = { q: sp.q?.trim() || undefined, cls: sp.cls || undefined, zone: sp.zone || undefined, shed: sp.shed || undefined, mfr: sp.mfr || undefined, state, page: Number(sp.page) || 1 };
  const { rows, total, page, error } = await adminSearch(supabase, f);
  const sel = (name: string, label: string, val: string | undefined, opts: string[]) => <div><label htmlFor={`a-${name}`} className="label">{label}</label>
    <select id={`a-${name}`} name={name} defaultValue={val ?? ""} className="input"><option value="">All</option>{opts.map(v => <option key={v}>{v}</option>)}</select></div>;
  const { page: _p, ...rest } = f;
  return <><PageHeader title="Manage locomotives" crumbs={[{ label: "Admin", href: "/admin" }, { label: "Locomotives" }]}><p><Link href="/admin/locos/new" className="btn btn-primary mt-2">Add locomotive</Link></p></PageHeader>
    <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end mb-6 p-4 bg-gray-50 border border-gray-200" role="search">
      <div><label htmlFor="a-q" className="label">Number</label><input id="a-q" name="q" defaultValue={f.q} inputMode="numeric" placeholder="e.g. 3045" className="input" /></div>
      {sel("cls", "Class", f.cls, o.classes.map(c => c.code))}{sel("shed", "Shed", f.shed, o.sheds.map(s => s.code))}{sel("zone", "Zone", f.zone, o.zones.map(z => z.code))}{sel("mfr", "Builder", f.mfr, o.manufacturers.map(m => m.code))}
      <div><label htmlFor="a-state" className="label">Listing</label><select id="a-state" name="state" defaultValue={state ?? ""} className="input"><option value="">All</option><option value="active">Listed</option><option value="archived">Archived</option></select></div>
      <div className="sm:col-span-2 lg:col-span-6 flex gap-2"><button className="btn btn-primary">Apply filters</button><Link href="/admin/locos" className="btn">Clear</Link></div></form>
    {error ? <p role="alert" className="notice notice-error">Could not load records: {error}</p> : <>
      <Pager base="/admin/locos" params={rest as Record<string, string | undefined>} page={page} total={total} />
      {rows.length === 0 ? <p className="notice">No locomotives match these filters.</p> :
      <div className="table-wrap"><table className="data-table"><caption className="sr-only">Locomotive records</caption><thead><tr><th scope="col" className="num">Number</th><th scope="col">Class</th><th scope="col">Shed</th><th scope="col">Zone</th><th scope="col">Builder</th><th scope="col">Verification</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead><tbody>
        {rows.map(r => <tr key={r.number}><td className="num">{r.number} {r.archived && <ArchivedBadge />}</td><td>{r.loco_classes.code}</td><td>{r.sheds.code}</td><td>{r.zones.code}</td><td>{r.manufacturers?.code ?? "—"}</td><td><VerificationBadge status={r.verification} /></td><td className="num">{formatDate(r.updated_at)}</td>
          <td className="whitespace-nowrap"><Link href={`/admin/locos/${r.number}/edit`}>Edit</Link>{!r.archived && <> · <Link href={`/locos/${r.number}`}>View public</Link></>}</td></tr>)}</tbody></table></div>}</>}</>;
}
