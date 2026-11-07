"use client";
import { useState, useTransition } from "react";
import { analyseUpload, submitUpload, type PreviewData } from "@/app/admin/(protected)/bulk/actions"; import { FIELD_LABEL, show } from "@/lib/requests";

export default function BulkUpload() {
  const [file, setFile] = useState<File | null>(null), [reason, setReason] = useState("");
  const [data, setData] = useState<PreviewData | null>(null), [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null), [pending, start] = useTransition();
  const fd = () => { const f = new FormData(); if (file) f.set("file", file); f.set("reason", reason); return f; };
  const analyse = () => start(async () => { setMsg(null); setData(null); const r = await analyseUpload(fd()); if (r.ok) setData(r.data); else setMsg({ kind: "error", text: r.message }); });
  const submit = () => start(async () => { setMsg(null); const r = await submitUpload(fd()); setMsg({ kind: r.ok ? "ok" : "error", text: r.message }); if (r.ok) { setData(null); setFile(null); setReason(""); } });
  const canSubmit = !!data && data.counts.items > 0 && reason.trim().length >= 5 && !pending;
  return <div className="space-y-6">
    <section className="border border-gray-200 rounded p-4 space-y-3 max-w-2xl"><h2 className="!mt-0 !border-0">1. Choose a file</h2>
      <div><label htmlFor="file" className="label">Excel file (.xlsx or .xls, up to 4 MB and 5,000 rows)</label>
        <input id="file" type="file" accept=".xlsx,.xls" className="input" onChange={e => { setFile(e.target.files?.[0] ?? null); setData(null); setMsg(null); }} /></div>
      <button className="btn btn-primary" disabled={!file || pending} onClick={analyse}>{pending && !data ? "Checking…" : "Check file"}</button></section>
    {msg && <p role={msg.kind === "error" ? "alert" : "status"} className={`notice ${msg.kind === "error" ? "notice-error" : "notice-ok"} max-w-2xl`}>{msg.text}</p>}
    {data && <>
      <section><h2 className="!mt-0">2. Review the results <span className="text-sm font-normal text-gray-600">({data.fileName})</span></h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Object.entries(data.summary).map(([k, v]) => <div key={k} className="stat-card"><dd className="text-2xl font-bold text-navy tabular-nums">{(v as number).toLocaleString()}</dd><dt className="text-xs text-gray-700">{k}</dt></div>)}</dl></section>
      {data.items.length > 0 && <section><h3>Changes to be submitted ({data.counts.items.toLocaleString()})</h3>
        <div className="table-wrap max-h-96 overflow-y-auto"><table className="data-table"><thead><tr><th scope="col" className="num">Locomotive</th><th scope="col">Action</th><th scope="col">Values</th></tr></thead><tbody>
          {data.items.map(i => <tr key={i.number}><td className="num">{i.number}</td><td>{i.action === "add" ? "New record" : "Fill missing"}</td>
            <td>{(Object.keys(i.after) as (keyof typeof FIELD_LABEL)[]).map(k => <span key={k} className="mr-3 inline-block"><b>{FIELD_LABEL[k]}:</b> {show(k, i.after[k])}</span>)}</td></tr>)}</tbody></table></div>
        {data.counts.items > data.items.length && <p className="hint">Showing the first {data.items.length} of {data.counts.items.toLocaleString()}. All are included when you submit.</p>}</section>}
      {data.counts.ignored > 0 && <section><h3>Existing values kept ({data.counts.ignored.toLocaleString()})</h3><p className="hint mb-2">The file differs from populated database values. These are not changed.</p>
        <div className="table-wrap max-h-64 overflow-y-auto"><table className="data-table"><thead><tr><th className="num" scope="col">Row</th><th scope="col" className="num">Locomotive</th><th scope="col">Field</th><th scope="col">In database</th><th scope="col">In file</th></tr></thead><tbody>
          {data.ignored.map((g, n) => <tr key={n}><td className="num">{g.row}</td><td className="num">{g.number}</td><td>{FIELD_LABEL[g.field]}</td><td>{g.existing}</td><td>{g.uploaded}</td></tr>)}</tbody></table></div></section>}
      {data.counts.issues > 0 && <section><h3>Invalid and duplicate rows ({data.counts.issues.toLocaleString()})</h3><p className="hint mb-2">These rows are left out of the submission. Fix them in the file and check again if they should be included.</p>
        <div className="table-wrap max-h-64 overflow-y-auto"><table className="data-table"><thead><tr><th className="num" scope="col">Row</th><th scope="col" className="num">Number</th><th scope="col">Problem</th></tr></thead><tbody>
          {data.issues.map((x, n) => <tr key={n}><td className="num">{x.row}</td><td className="num">{x.number ?? "—"}</td><td>{x.message}</td></tr>)}</tbody></table></div></section>}
      <section className="border border-gray-200 rounded p-4 space-y-3 max-w-2xl"><h2 className="!mt-0 !border-0">3. Submit</h2>
        <div><label htmlFor="reason" className="label">Reason or explanation <span aria-hidden="true">*</span></label>
          <textarea id="reason" rows={3} maxLength={2000} className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this data being added or updated?" />
          <p className="hint">Recorded with your name and the time in each locomotive’s activity history.</p></div>
        {data.counts.items === 0 && <p className="notice notice-warn">There is nothing to submit from this file.</p>}
        <button className="btn btn-primary" disabled={!canSubmit} onClick={submit}>{pending ? "Submitting…" : `Submit ${data.counts.items.toLocaleString()} record(s)`}</button></section></>}
  </div>;
}
