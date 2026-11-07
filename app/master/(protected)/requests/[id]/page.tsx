import Link from "next/link"; import { notFound } from "next/navigation"; import { requireMaster } from "@/lib/master-auth"; import PageHeader from "@/components/PageHeader"; import StatusBadge from "@/components/master/StatusBadge";
import ReviewPanel from "@/components/master/ReviewPanel";
import { FIELD_KEYS, FIELD_LABEL, TYPE_LABEL, changedKeys, fetchSnapshots, reqId, show, norm, type Item, type RequestStatus, type RequestType, type Snapshot } from "@/lib/requests";
export const metadata = { title: "Request preview" };
const PAGE = 50;
const stamp = (v: string | null) => (v ? new Date(v).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium" }) + " IST" : "—");
const Diff = ({ k, a, b }: { k: Parameters<typeof show>[0]; a: any; b: any }) => <><span className="diff-old">{show(k, a)}</span> <span aria-hidden="true">→</span> <span className="diff-new">{show(k, b)}</span></>;

export default async function RequestPreview({ params, searchParams }: { params: { id: string }; searchParams: { action?: string; page?: string } }) {
  if (!/^\d{1,9}$/.test(params.id)) notFound();
  const { supabase: sb, user } = await requireMaster(); const id = Number(params.id);
  const [{ data: r, error }, { data: audit }] = await Promise.all([sb.from("change_requests").select("*").eq("id", id).maybeSingle(),
    sb.from("audit_log").select("id,event,actor_email,detail,at").eq("request_id", id).order("at")]);
  if (error) return <p role="alert" className="notice notice-error">Could not load this request.</p>;
  if (!r) notFound();
  const type = r.request_type as RequestType, status = r.status as RequestStatus;
  const items: Item[] = r.payload?.items ?? [], summary = r.payload?.summary as Record<string, number> | undefined;
  const page = Math.max(1, Number(searchParams.page) || 1), pages = Math.max(1, Math.ceil(items.length / PAGE));
  const shown = type === "bulk_upload" ? items.slice((page - 1) * PAGE, page * PAGE) : items;
  const live = await fetchSnapshots(sb, shown.map(i => i.number)).catch(() => new Map<number, Snapshot>());
  const stale = (i: Item) => i.action === "update" && i.mode === "edit" && FIELD_KEYS.some(k => k in i.after && norm(live.get(i.number)?.[k]) !== norm(i.before?.[k]));
  const blocked = status !== "pending" ? undefined : r.submitted_by === user.id ? "You submitted this request, so you cannot review it." : undefined;
  const initial = searchParams.action === "approve" || searchParams.action === "decline" ? searchParams.action : undefined;
  return <><PageHeader title={`Request ${reqId(r.id)}`} crumbs={[{ label: "Master Admin", href: "/master" }, { label: reqId(r.id) }]} />
    <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm mb-4">
      <div><dt className="text-gray-600">Status</dt><dd><StatusBadge status={status} /></dd></div><div><dt className="text-gray-600">Type</dt><dd>{TYPE_LABEL[type]}</dd></div>
      <div><dt className="text-gray-600">Submitted by</dt><dd className="break-all">{r.submitted_by_email}</dd></div><div><dt className="text-gray-600">Submitted</dt><dd>{stamp(r.submitted_at)}</dd></div>
      <div><dt className="text-gray-600">Locomotives</dt><dd>{(r.locomotive_numbers as number[]).length.toLocaleString()}</dd></div>
      {r.file_name && <div><dt className="text-gray-600">Uploaded file</dt><dd className="break-all">{r.file_name}</dd></div>}
      {r.reviewed_at && <><div><dt className="text-gray-600">{status === "approved" ? "Approved by" : "Declined by"}</dt><dd className="break-all">{r.reviewed_by_email}</dd></div><div><dt className="text-gray-600">Decision time</dt><dd>{stamp(r.reviewed_at)}</dd></div></>}</dl>
    <div className="notice mb-2"><b>Reason / comments from the admin:</b> <span className="whitespace-pre-wrap break-words">{r.reason}</span></div>
    {r.decline_reason && <div className="notice notice-error mb-2"><b>Rejection reason:</b> <span className="whitespace-pre-wrap break-words">{r.decline_reason}</span></div>}
    {status === "pending" && <ReviewPanel id={r.id} initial={initial} blocked={blocked} />}
    {summary && <><h2>Upload summary</h2><dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Object.entries(summary).map(([k, v]) => <div key={k} className="stat-card"><dd className="text-2xl font-bold text-navy tabular-nums">{v}</dd><dt className="text-xs text-gray-700">{k}</dt></div>)}</dl></>}
    <h2>{type === "bulk_upload" ? `Proposed changes (${items.length.toLocaleString()} locomotives)` : "Current record and proposed changes"}</h2>
    {type !== "bulk_upload" ? shown.map(it => { const cur = live.get(it.number), keys = new Set(it.action === "add" ? Object.keys(it.after) : changedKeys(it.before ?? {}, it.after));
      return <div key={it.number} className="mb-6"><h3 className="!mt-0">Locomotive {it.number} {it.action === "add" ? <span className="badge badge-source_listed">New</span> : null}</h3>
        {it.action === "add" && cur && <p role="alert" className="notice notice-warn mb-2">This locomotive now exists in the live database. Approval will be refused; decline this request.</p>}
        {stale(it) && <p role="alert" className="notice notice-warn mb-2">The live record has changed since this was submitted. Approval will be refused; decline it and ask for a fresh request.</p>}
        <div className="table-wrap max-w-3xl"><table className="data-table"><thead><tr><th scope="col">Field</th><th scope="col">Current (live)</th><th scope="col">Proposed</th></tr></thead><tbody>
          {FIELD_KEYS.map(k => { const ch = keys.has(k); const proposed = k in it.after ? it.after[k] : cur?.[k]; return <tr key={k} className={ch ? "row-changed" : ""}><th scope="row" className="font-medium">{FIELD_LABEL[k]}</th>
            <td>{show(k, cur?.[k])}</td><td>{ch ? <Diff k={k} a={cur?.[k] ?? null} b={it.after[k]} /> : show(k, proposed)}</td></tr>; })}</tbody></table></div></div>; })
    : <><div className="table-wrap"><table className="data-table"><thead><tr><th scope="col" className="num">Locomotive</th><th scope="col">Action</th><th scope="col">Details</th></tr></thead><tbody>
        {shown.map(it => <tr key={it.number}><td className="num">{it.number}</td><td>{it.action === "add" ? "New record" : "Fill missing fields"}</td>
          <td>{(Object.keys(it.after) as (keyof Snapshot)[]).map(k => <div key={k}><b>{FIELD_LABEL[k]}:</b> {it.action === "add" ? show(k, it.after[k]) : <Diff k={k} a={live.get(it.number)?.[k] ?? null} b={it.after[k]} />}</div>)}</td></tr>)}</tbody></table></div>
      <nav className="flex gap-5 my-3 text-sm" aria-label="Pagination"><span>Page {page} of {pages}</span>
        {page > 1 && <Link href={`?page=${page - 1}`}>← Previous</Link>}{page < pages && <Link href={`?page=${page + 1}`}>Next →</Link>}</nav></>}
    <h2>Audit history</h2>
    <ol className="space-y-2 text-sm">{(audit ?? []).map((a: any) => <li key={a.id} className="border-l-4 border-navy pl-3"><b className="capitalize">{a.event}</b> by {a.actor_email} · {stamp(a.at)}
      {a.detail?.reason && <> — {a.detail.reason}</>}{typeof a.detail?.applied === "number" && <> — {a.detail.applied} record(s) applied</>}</li>)}</ol></>;
}
