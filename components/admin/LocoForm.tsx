"use client";
import Link from "next/link"; import { useFormState } from "react-dom";
import type { FormState } from "@/lib/loco-schema"; import { VERIFICATION } from "@/lib/loco-schema"; import { VERIFICATION_LABEL } from "@/lib/format"; import SubmitButton from "./SubmitButton";
type Opt = { id: number; code: string; name?: string | null };
export type FormOptions = { classes: Opt[]; sheds: Opt[]; zones: Opt[]; manufacturers: Opt[] };
export default function LocoForm({ mode, action, options, initial }: { mode: "create" | "edit"; action: (s: FormState, f: FormData) => Promise<FormState>; options: FormOptions; initial: Record<string, string> }) {
  const [s, formAction] = useFormState<FormState, FormData>(action, { status: "idle" });
  const v = (k: string) => s.values?.[k] ?? initial[k] ?? "";
  const fe = s.fieldErrors ?? {};
  const err = (k: string) => fe[k] ? <p id={`${k}-err`} className="field-error">{fe[k]}</p> : null;
  const aria = (k: string) => ({ "aria-invalid": !!fe[k], "aria-describedby": fe[k] ? `${k}-err` : undefined });
  const select = (k: string, label: string, opts: Opt[], required: boolean, fmt: (o: Opt) => string) => <div><label htmlFor={k} className="label">{label}{required && <span aria-hidden="true"> *</span>}</label>
    <select id={k} name={k} defaultValue={v(k)} required={required} className="input" {...aria(k)}><option value="">{required ? "Choose…" : "None / unknown"}</option>{opts.map(o => <option key={o.id} value={o.id}>{fmt(o)}</option>)}</select>{err(k)}</div>;
  return <form action={formAction} noValidate className="space-y-5 max-w-2xl">
    {s.status === "error" && s.message && <p role="alert" className="notice notice-error">{s.message}</p>}
    {s.status === "success" && s.message && <p role="status" className="notice notice-ok">{s.message} Your submission is recorded in the activity history.</p>}
    <fieldset className="grid sm:grid-cols-2 gap-4"><legend className="text-base font-semibold text-navy mb-2">Identification</legend>
      <div><label htmlFor="number" className="label">Locomotive number <span aria-hidden="true">*</span></label>
        <input id="number" name="number" inputMode="numeric" maxLength={5} required readOnly={mode === "edit"} defaultValue={v("number")} className={`input ${mode === "edit" ? "bg-gray-100" : ""}`} {...aria("number")} />
        <p className="hint">{mode === "edit" ? "The number identifies the record and cannot be changed here." : "Five digits, 10000–99999. Must be unique."}</p>{err("number")}</div>
      {select("class_id", "Class", options.classes, true, o => o.code)}
      {select("manufacturer_id", "Manufacturer / builder", options.manufacturers, false, o => o.name ? `${o.code}: ${o.name}` : o.code)}</fieldset>
    <fieldset className="grid sm:grid-cols-2 gap-4"><legend className="text-base font-semibold text-navy mb-2">Allocation</legend>
      {select("shed_id", "Shed", options.sheds, true, o => `${o.code}: ${o.name}`)}{select("zone_id", "Zone", options.zones, true, o => `${o.code}: ${o.name}`)}</fieldset>
    <fieldset className="grid sm:grid-cols-2 gap-4"><legend className="text-base font-semibold text-navy mb-2">Equipment and status</legend>
      <div><label htmlFor="kavach_make" className="label">Kavach make</label><input id="kavach_make" name="kavach_make" maxLength={100} defaultValue={v("kavach_make")} className="input" {...aria("kavach_make")} />{err("kavach_make")}</div>
      <div><label htmlFor="service_status" className="label">Service status</label><input id="service_status" name="service_status" maxLength={100} defaultValue={v("service_status")} className="input" {...aria("service_status")} />{err("service_status")}</div></fieldset>
    <fieldset className="grid sm:grid-cols-2 gap-4"><legend className="text-base font-semibold text-navy mb-2">Verification</legend>
      <div><label htmlFor="verification" className="label">Verification status <span aria-hidden="true">*</span></label>
        <select id="verification" name="verification" defaultValue={v("verification") || "unverified"} required className="input" {...aria("verification")}>{VERIFICATION.map(x => <option key={x} value={x}>{VERIFICATION_LABEL[x]}</option>)}</select>{err("verification")}</div>
      <div><label htmlFor="last_verified" className="label">Last verified</label><input id="last_verified" name="last_verified" type="date" defaultValue={v("last_verified")} className="input" {...aria("last_verified")} />{err("last_verified")}</div></fieldset>
    {mode === "edit" && <div className="flex items-start gap-2"><input id="archived" name="archived" type="checkbox" defaultChecked={v("archived") === "on" || v("archived") === "true"} className="mt-1 h-4 w-4" />
      <label htmlFor="archived" className="text-sm"><span className="font-medium">Archived</span>: hide this record from the public site. Reversible; nothing is deleted.</label></div>}
    <fieldset><legend className="text-base font-semibold text-navy mb-2">Reason for this submission</legend>
      <label htmlFor="reason" className="label">Why is this information being {mode === "create" ? "added" : "changed"}? <span aria-hidden="true">*</span></label>
      <textarea id="reason" name="reason" rows={3} maxLength={2000} required defaultValue={v("reason")} className="input" placeholder="For example: verified against the shed's latest allocation list" {...aria("reason")} />
      <p className="hint">Recorded with your name and the time in the activity history.</p>{err("reason")}</fieldset>
    <div className="flex flex-wrap gap-3 pt-2"><SubmitButton pending="Submitting…">{mode === "create" ? "Submit new locomotive" : "Submit changes"}</SubmitButton><Link href="/admin/locos" className="btn">Back to list</Link></div>
    <p className="hint">* required</p></form>;
}
