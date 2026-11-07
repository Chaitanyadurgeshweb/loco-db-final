"use client";
import { useEffect, useRef, useState } from "react"; import { useFormState } from "react-dom"; import { useRouter } from "next/navigation";
import type { FormState } from "@/lib/loco-schema"; import { reviewRequest } from "@/app/master/actions"; import SubmitButton from "@/components/admin/SubmitButton";
export default function ReviewPanel({ id, initial, blocked }: { id: number; initial?: "approve" | "decline"; blocked?: string }) {
  const [s, action] = useFormState<FormState, FormData>(reviewRequest, { status: "idle" });
  const [mode, setMode] = useState<"approve" | "decline" | null>(null);
  const ref = useRef<HTMLDialogElement>(null), router = useRouter();
  useEffect(() => { if (initial && !blocked) setMode(initial); }, [initial, blocked]);
  useEffect(() => { const d = ref.current; if (!d) return; if (mode && !d.open) d.showModal(); if (!mode && d.open) d.close(); }, [mode]);
  useEffect(() => { if (s.status === "success") { setMode(null); router.replace(`/master/requests/${id}`); router.refresh(); } }, [s.status, id, router]);
  return <div className="my-6">
    {s.status === "success" && <p role="status" className="notice notice-ok mb-3">{s.message}</p>}
    {s.status === "error" && !mode && <p role="alert" className="notice notice-error mb-3">{s.message}</p>}
    {blocked && <p className="notice notice-warn mb-3">{blocked}</p>}
    <div className="flex flex-wrap gap-3"><button className="btn btn-primary" disabled={!!blocked} onClick={() => setMode("approve")}>Approve…</button>
      <button className="btn btn-danger" disabled={!!blocked} onClick={() => setMode("decline")}>Decline…</button></div>
    <dialog ref={ref} className="modal" onClose={() => setMode(null)} aria-labelledby="review-title">
      <form action={action} className="p-6 space-y-4"><input type="hidden" name="id" value={id} /><input type="hidden" name="decision" value={mode ?? ""} />
        <h2 id="review-title" className="!mt-0 !border-0 !pb-0">{mode === "approve" ? "Approve this request?" : "Decline this request?"}</h2>
        <p className="text-sm text-gray-700">{mode === "approve" ? "The proposed data will be written to the live locomotive records now. This is recorded in the audit history and cannot be undone from this screen." : "No live data will change. Your reason is recorded in the audit history."}</p>
        {mode === "decline" && <div><label htmlFor="reason" className="label">Reason for declining <span aria-hidden="true">*</span></label><textarea id="reason" name="reason" rows={3} maxLength={1000} required className="input" aria-invalid={!!s.fieldErrors?.reason} />{s.fieldErrors?.reason && <p className="field-error">{s.fieldErrors.reason}</p>}</div>}
        {s.status === "error" && mode && <p role="alert" className="notice notice-error">{s.message}</p>}
        <div className="flex justify-end gap-3"><button type="button" className="btn" onClick={() => setMode(null)}>Cancel</button>
          <SubmitButton pending={mode === "approve" ? "Approving…" : "Declining…"} className={mode === "decline" ? "!bg-rail !border-rail" : ""}>{mode === "approve" ? "Confirm approval" : "Confirm decline"}</SubmitButton></div></form></dialog></div>;
}
