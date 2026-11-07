import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";
import { VERIFICATION } from "@/lib/loco-schema";
import { fetchSnapshots, norm, type FieldKey, type Item, type Snapshot } from "@/lib/requests";

/** Official template columns (order matches the reference workbook). */
export const TEMPLATE_HEADERS = ["Locomotive number", "Class", "Manufacturer / builder", "Shed", "Zone", "Kavach make", "Service status", "Verification status", "Last verified"] as const;
const COLS: Record<string, FieldKey | "number"> = { locomotivenumber: "number", number: "number", class: "class", manufacturerbuilder: "manufacturer", manufacturer: "manufacturer", builder: "manufacturer",
  shed: "shed", zone: "zone", kavachmake: "kavach_make", servicestatus: "service_status", verificationstatus: "verification", lastverified: "last_verified" };
/** Fields that may be filled on an EXISTING locomotive (the others are mandatory in the database, so they are never "missing"). */
const FILLABLE: FieldKey[] = ["manufacturer", "kavach_make", "service_status", "last_verified"];
export const MAX_ROWS = 5000, MAX_BYTES = 4 * 1024 * 1024;

export type RowIssue = { row: number; number?: string; message: string };
export type Ignored = { row: number; number: number; field: FieldKey; existing: string; uploaded: string };
export type Summary = { "Rows in file": number; "New locomotives": number; "Existing locomotives": number; "Missing fields to fill": number; "Records needing updates": number; "Duplicate rows": number; "Existing, nothing to add": number; "Invalid rows": number };
export type Analysis = { ok: true; summary: Summary; items: Item[]; issues: RowIssue[]; ignored: Ignored[] } | { ok: false; message: string };
const key = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const code = (s: string) => s.toUpperCase().replace(/[\s\-_/]/g, "");

function toDate(v: unknown): { v: string | null; err?: string } {
  if (v === null || v === undefined || String(v).trim() === "") return { v: null };
  let y = 0, m = 0, d = 0;
  if (typeof v === "number") { const p = XLSX.SSF.parse_date_code(v); if (!p) return { v: null, err: "Invalid date" }; ({ y, m, d } = p); }
  else { const t = String(v).trim(); const a = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t), b = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(t);
    if (a) { y = +a[1]; m = +a[2]; d = +a[3]; } else if (b) { d = +b[1]; m = +b[2]; y = +b[3]; } else return { v: null, err: `Unrecognised date “${t.slice(0, 20)}” (use YYYY-MM-DD or DD-MM-YYYY)` }; }
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return { v: null, err: "Invalid calendar date" };
  if (dt.getTime() > Date.now() + 86400000) return { v: null, err: "Date is in the future" };
  return { v: dt.toISOString().slice(0, 10) };
}

type Ref = { id: number; code: string; name?: string | null };
function lookup(list: Ref[], raw: string): string | null {
  const c = code(raw), n = raw.trim().toLowerCase();
  return list.find(x => code(x.code) === c)?.code ?? list.find(x => x.name && x.name.trim().toLowerCase() === n)?.code ?? null;
}

export async function analyse(sb: SupabaseClient, buf: ArrayBuffer): Promise<Analysis> {
  let rows: unknown[][];
  try {
    const wb = XLSX.read(buf, { type: "array", cellDates: false, cellFormula: false, cellHTML: false });
    const ws = wb.Sheets[wb.SheetNames[0]]; if (!ws) return { ok: false, message: "The workbook has no sheets." };
    rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: null, blankrows: false });
  } catch { return { ok: false, message: "The file could not be read as an Excel workbook (.xlsx or .xls)." }; }
  if (rows.length < 2) return { ok: false, message: "The file has no data rows below the header row." };
  if (rows.length - 1 > MAX_ROWS) return { ok: false, message: `The file has more than ${MAX_ROWS.toLocaleString()} rows. Split it into smaller files.` };
  const col: Partial<Record<FieldKey | "number", number>> = {};
  (rows[0] as unknown[]).forEach((h, i) => { const k = COLS[key(h)]; if (k && col[k] === undefined) col[k] = i; });
  const missing = (["number", "class", "shed", "zone"] as const).filter(k => col[k] === undefined);
  if (missing.length) return { ok: false, message: `The header row does not match the template. Missing column(s): ${missing.join(", ")}. Download the template and use its column names.` };

  const [c, s, z, m] = await Promise.all([sb.from("loco_classes").select("id,code"), sb.from("sheds").select("id,code,name"), sb.from("zones").select("id,code,name"), sb.from("manufacturers").select("id,code,name")]);
  if (c.error || s.error || z.error || m.error) return { ok: false, message: "Could not read the reference lists. Please try again." };
  const ref = { class: (c.data ?? []) as Ref[], shed: (s.data ?? []) as Ref[], zone: (z.data ?? []) as Ref[], manufacturer: (m.data ?? []) as Ref[] };

  type Parsed = { row: number; number: number; vals: Snapshot };
  const issues: RowIssue[] = [], parsed: Parsed[] = [], seen = new Set<number>();
  let duplicates = 0;
  rows.slice(1).forEach((r, idx) => {
    const row = idx + 2, cell = (k: FieldKey | "number") => (col[k] === undefined ? null : (r as unknown[])[col[k]!]);
    const rawNum = cell("number"), numStr = typeof rawNum === "number" ? String(Math.trunc(rawNum)) : String(rawNum ?? "").trim();
    const errs: string[] = [];
    if (!/^\d{5}$/.test(numStr) || Number(numStr) < 10000) { issues.push({ row, number: numStr || undefined, message: "Locomotive number must be 5 digits (10000–99999)." }); return; }
    const number = Number(numStr);
    if (seen.has(number)) { duplicates++; issues.push({ row, number: numStr, message: "Duplicate of an earlier row in this file; ignored." }); return; }
    seen.add(number);
    const vals: Snapshot = {};
    for (const k of ["class", "shed", "zone", "manufacturer"] as const) {
      const raw = String(cell(k) ?? "").trim(); if (!raw) continue;
      const found = lookup(ref[k], raw); if (found === null) errs.push(`Unknown ${k} “${raw.slice(0, 30)}”`); else vals[k] = found;
    }
    for (const k of ["kavach_make", "service_status"] as const) { const raw = String(cell(k) ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim(); if (raw.length > 100) errs.push(`${k === "kavach_make" ? "Kavach make" : "Service status"} is longer than 100 characters`); else if (raw) vals[k] = raw; }
    const vr = String(cell("verification") ?? "").trim();
    if (vr) { const v = key(vr); const hit = VERIFICATION.find(x => key(x) === v); if (hit) vals.verification = hit; else errs.push(`Unknown verification status “${vr.slice(0, 30)}”`); }
    const dt = toDate(cell("last_verified")); if (dt.err) errs.push(dt.err); else if (dt.v) vals.last_verified = dt.v;
    if (errs.length) issues.push({ row, number: numStr, message: errs.join("; ") }); else parsed.push({ row, number, vals });
  });

  const live = await fetchSnapshots(sb, parsed.map(p => p.number)).catch(() => null);
  if (!live) return { ok: false, message: "Could not read the existing locomotive records. Please try again." };
  const items: Item[] = [], ignored: Ignored[] = [];
  let fields = 0, updates = 0, existing = 0, unchanged = 0, newRecs = 0;
  for (const p of parsed) {
    const cur = live.get(p.number);
    if (!cur) {
      const miss = (["class", "shed", "zone"] as const).filter(k => !p.vals[k]);
      if (miss.length) { issues.push({ row: p.row, number: String(p.number), message: `New locomotive is missing required value(s): ${miss.join(", ")}.` }); continue; }
      newRecs++; items.push({ number: p.number, action: "add", after: { ...p.vals, verification: p.vals.verification ?? "unverified" } }); continue;
    }
    existing++;
    const before: Snapshot = {}, after: Snapshot = {};
    for (const k of Object.keys(p.vals) as FieldKey[]) {
      const have = norm(cur[k]), want = norm(p.vals[k]);
      if (have === null) { if (FILLABLE.includes(k)) { before[k] = null; after[k] = want; } }       // missing on the live record: take it from the file
      else if (want !== have) ignored.push({ row: p.row, number: p.number, field: k, existing: String(have), uploaded: String(want) });   // populated: never overwritten
    }
    const n = Object.keys(after).length;
    if (n) { updates++; fields += n; items.push({ number: p.number, action: "update", mode: "fill_missing", before, after }); } else unchanged++;
  }
  const summary: Summary = { "Rows in file": rows.length - 1, "New locomotives": newRecs, "Existing locomotives": existing, "Missing fields to fill": fields, "Records needing updates": updates,
    "Duplicate rows": duplicates, "Existing, nothing to add": unchanged, "Invalid rows": issues.length - duplicates };
  return { ok: true, summary, items, issues, ignored };
}

export function buildTemplate(): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[...TEMPLATE_HEADERS]]), "Locomotives");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Column", "Rules"],
    ["Locomotive number", "Required. 5 digits, 10000–99999."], ["Class", "Required for new locomotives. Class code, e.g. WAG7."], ["Manufacturer / builder", "Optional. Code, e.g. CLW."],
    ["Shed", "Required for new locomotives. Shed code (or exact name)."], ["Zone", "Required for new locomotives. Zone code (or exact name)."], ["Kavach make", "Optional, up to 100 characters."],
    ["Service status", "Optional, up to 100 characters."], ["Verification status", "Optional: Unverified, Source listed, Verified or Disputed. New records default to Unverified."],
    ["Last verified", "Optional. YYYY-MM-DD or DD-MM-YYYY, not in the future."], ["", ""], ["Existing locomotives", "Only empty fields (manufacturer, Kavach make, service status, last verified) are filled. Populated values are never overwritten."]]), "Instructions");
  return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer);
}
