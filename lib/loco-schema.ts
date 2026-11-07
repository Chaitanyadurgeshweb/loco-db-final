export const VERIFICATION = ["unverified", "source_listed", "verified", "disputed"] as const;
export type Verification = (typeof VERIFICATION)[number];
export type FormState = { status: "idle" | "error" | "success"; message?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };
export type LocoInput = { class_id: number; shed_id: number; zone_id: number; manufacturer_id: number | null; kavach_make: string | null;
  service_status: string | null; verification: Verification; last_verified: string | null; archived: boolean };

const clean = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim() : "");
const isId = (s: string) => /^\d{1,9}$/.test(s) && Number(s) > 0;

export function parseNumber(raw: string): number | null { return /^\d{5}$/.test(raw) && Number(raw) >= 10000 ? Number(raw) : null; }

/** Server-side validation. Mirrors the database constraints (number 10000-99999, enum, FKs) so users get clear messages. */
export function parseLocoForm(fd: FormData):
  { ok: true; number: number; value: LocoInput; reason: string; values: Record<string, string> } | { ok: false; fieldErrors: Record<string, string>; values: Record<string, string> } {
  const g = (k: string) => clean(fd.get(k));
  const values: Record<string, string> = { number: g("number"), class_id: g("class_id"), shed_id: g("shed_id"), zone_id: g("zone_id"),
    manufacturer_id: g("manufacturer_id"), kavach_make: g("kavach_make"), service_status: g("service_status"),
    verification: g("verification"), last_verified: g("last_verified"), archived: fd.get("archived") ? "on" : "", reason: g("reason") };
  const e: Record<string, string> = {};
  const number = parseNumber(values.number);
  if (number === null) e.number = "Enter a 5-digit locomotive number between 10000 and 99999.";
  if (!isId(values.class_id)) e.class_id = "Choose a class.";
  if (!isId(values.shed_id)) e.shed_id = "Choose a shed.";
  if (!isId(values.zone_id)) e.zone_id = "Choose a zone.";
  if (values.manufacturer_id && !isId(values.manufacturer_id)) e.manufacturer_id = "Choose a valid manufacturer or leave blank.";
  if (values.kavach_make.length > 100) e.kavach_make = "Use 100 characters or fewer.";
  if (values.service_status.length > 100) e.service_status = "Use 100 characters or fewer.";
  if (!(VERIFICATION as readonly string[]).includes(values.verification)) e.verification = "Choose a verification status.";
  if (values.last_verified) {
    const d = new Date(values.last_verified + "T00:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.last_verified) || isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== values.last_verified) e.last_verified = "Enter a valid date (YYYY-MM-DD).";
    else if (d.getTime() > Date.now() + 86400000) e.last_verified = "The verification date cannot be in the future.";
  }
  if (values.reason.length < 5) e.reason = "Explain why this information is being added or changed (at least 5 characters).";
  else if (values.reason.length > 2000) e.reason = "Use 2000 characters or fewer.";
  if (Object.keys(e).length || number === null) return { ok: false, fieldErrors: e, values };
  return { ok: true, number, values, reason: values.reason, value: { class_id: Number(values.class_id), shed_id: Number(values.shed_id), zone_id: Number(values.zone_id),
    manufacturer_id: values.manufacturer_id ? Number(values.manufacturer_id) : null, kavach_make: values.kavach_make || null,
    service_status: values.service_status || null, verification: values.verification as Verification, last_verified: values.last_verified || null,
    archived: values.archived === "on" } };
}
