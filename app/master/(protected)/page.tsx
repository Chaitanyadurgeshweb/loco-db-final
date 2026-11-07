import Link from "next/link"; import { requireMaster } from "@/lib/master-auth"; import PageHeader from "@/components/PageHeader"; import StatusBadge from "@/components/master/StatusBadge";
import { TYPE_LABEL, reqId, type RequestStatus, type RequestType } from "@/lib/requests";
export const metadata = { title: "Approval dashboard" };
const PAGE = 20;
type Search = { q?: string; status?: string; type?: string; page?: string };
const stamp = (v: string) => new Date(v).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

export default async function MasterDashboard({ searchParams }: { searchParams: Search }) {
  const { supabase: sb } = await requireMaster();
  const status = ["pending", "approved", "declined"].includes(searchParams.status ?? "") ? searchParams.status : undefined;
  const type = ["add", "edit", "bulk_upload"].includes(searchParams.type ?? "") ? searchParams.type : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1), digits = (searchParams.q ?? "").replace(/\D/g, "").slice(0, 9);
  const count = (f?: (q: any) => any) => { const q = sb.from("change_requests").select("id", { count: "exact", head: true }); return (f ? f(q) : q).then((r: any) => r.count as number | null); };
  let list = sb.from("change_requests").select("id,request_type,status,submitted_by_email,submitted_at,locomotive_numbers", { count: "exact" });
  if (status) list = list.eq("status", status); if (type) list = list.eq("request_type", type);
  if (digits) list = /^\d{5}$/.test(digits) && Number(digits) >= 10000 ? list.or(`id.eq.${Number(digits)},locomotive_numbers.cs.{${Number(digits)}}`) : list.eq("id", Number(digits));
  const [total, approved, pending, declined, adds, edits, bulks, res] = await Promise.all([count(), count(q => q.eq("status", "approved")), count(q => q.eq("status", "pending")), count(q => q.eq("status", "declined")),
    count(q => q.eq("request_type", "add")), count(q => q.eq("request_type", "edit")), count(q => q.eq("request_type", "bulk_upload")),
    list.order("submitted_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1)]);
  const stats: [string, number | null, string][] = [["Total requests", total, ""], ["Pending", pending, "border-t-4 border-t-amber-500"], ["Approved", approved, "border-t-4 border-t-green-600"], ["Declined", declined, "border-t-4 border-t-red-600"],
    ["New locomotive additions", adds, ""], ["Modification requests", edits, ""], ["Bulk upload requests", bulks, ""]];
  const rows = (res.data ?? []) as any[], pages = Math.max(1, Math.ceil((res.count ?? 0) / PAGE));
  const href = (p: number) => { const u = new URLSearchParams(); if (searchParams.q) u.set("q", searchParams.q); if (status) u.set("status", status); if (type) u.set("type", type); u.set("page", String(p)); return `/master?${u}`; };
  return <><PageHeader title="Approval dashboard" crumbs={[{ label: "Master Admin" }]}><p>Review submitted locomotive data. Nothing reaches the live records until you approve it.</p></PageHeader>
    <dl className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">{stats.map(([l, v, c]) => <div key={l} className={`stat-card ${c}`}><dd className="text-3xl font-bold text-navy tabular-nums">{v === null ? "—" : v.toLocaleString()}</dd><dt className="text-xs text-gray-700 mt-1">{l}</dt></div>)}</dl>
    <form className="flex flex-wrap items-end gap-3 mb-4" role="search">
      <div><label htmlFor="q" className="label">Request ID or locomotive no.</label><input id="q" name="q" defaultValue={searchParams.q} inputMode="numeric" className="input w-56" /></div>
      <div><label htmlFor="status" className="label">Status</label><select id="status" name="status" defaultValue={status ?? ""} className="input"><option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="declined">Declined</option></select></div>
      <div><label htmlFor="type" className="label">Type</label><select id="type" name="type" defaultValue={type ?? ""} className="input"><option value="">All</option><option value="add">Add</option><option value="edit">Edit</option><option value="bulk_upload">Bulk upload</option></select></div>
      <button className="btn btn-primary">Filter</button><Link href="/master" className="btn">Reset</Link></form>
    {res.error ? <p role="alert" className="notice notice-error">Could not load requests.</p> : rows.length === 0 ? <p className="notice">No requests match.</p> :
    <div className="table-wrap"><table className="data-table"><thead><tr><th scope="col">Request ID</th><th scope="col">Type</th><th scope="col">Submitted by</th><th scope="col">Submitted</th><th scope="col">Locomotive</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>
      {rows.map(r => { const n: number[] = r.locomotive_numbers ?? []; const p = `/master/requests/${r.id}`;
        return <tr key={r.id}><td className="num"><Link href={p}>{reqId(r.id)}</Link></td><td>{TYPE_LABEL[r.request_type as RequestType]}</td><td className="break-all">{r.submitted_by_email}</td><td className="num">{stamp(r.submitted_at)}</td>
          <td className="num">{n[0] ?? "—"}{n.length > 1 && <span className="text-gray-600"> +{n.length - 1} more</span>}</td><td><StatusBadge status={r.status as RequestStatus} /></td>
          <td className="whitespace-nowrap"><Link href={p}>Preview</Link>{r.status === "pending" && <> · <Link href={`${p}?action=approve`}>Approve</Link> · <Link href={`${p}?action=decline`}>Decline</Link></>}</td></tr>; })}</tbody></table></div>}
    <nav className="flex flex-wrap gap-x-5 items-center my-3 text-sm" aria-label="Pagination"><span>{(res.count ?? 0).toLocaleString()} requests · page {page} of {pages}</span>
      {page > 1 && <Link href={href(page - 1)}>← Previous</Link>}{page < pages && <Link href={href(page + 1)}>Next →</Link>}</nav></>;
}
