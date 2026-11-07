"use server";
import { getAdmin } from "@/lib/auth"; import { formOptions } from "@/lib/admin-data";
import { parseLocoForm, type FormState, type LocoInput } from "@/lib/loco-schema";
import { changedKeys, fetchSnapshots, norm, reqId, type Item, type Snapshot } from "@/lib/requests"; import { submitRequest } from "@/lib/submit";

const DENIED: FormState = { status: "error", message: "You are not signed in as an administrator. Sign in again." };
type Opts = Awaited<ReturnType<typeof formOptions>>;
/** Form ids -> codes, so a request stays readable and does not depend on internal row ids. */
function toSnapshot(v: LocoInput, o: Opts, withArchived: boolean): Snapshot | null {
  const code = (list: { id: number; code: string }[], id: number | null) => (id === null ? null : list.find(x => x.id === id)?.code ?? undefined);
  const cls = code(o.classes, v.class_id), shed = code(o.sheds, v.shed_id), zone = code(o.zones, v.zone_id), mfr = code(o.manufacturers, v.manufacturer_id);
  if (!cls || !shed || !zone || mfr === undefined) return null;
  const s: Snapshot = { class: cls, shed, zone, manufacturer: mfr, kavach_make: norm(v.kavach_make), service_status: norm(v.service_status), verification: v.verification, last_verified: norm(v.last_verified) };
  if (withArchived) s.archived = v.archived;
  return s;
}
const BAD_REF: FormState = { status: "error", message: "The chosen class, shed, zone or manufacturer no longer exists. Reload the page and try again." };
const sent = (id: number, values: Record<string, string>): FormState => ({ status: "success", message: `Submitted successfully. Reference ${reqId(id)}.`, values });

export async function createLoco(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await getAdmin(); if (!admin) return DENIED;
  const p = parseLocoForm(fd);
  if (!p.ok) return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: p.fieldErrors, values: p.values };
  const snap = toSnapshot(p.value, await formOptions(admin.supabase), false); if (!snap) return { ...BAD_REF, values: p.values };
  const { count, error: e1 } = await admin.supabase.from("locomotives").select("number", { count: "exact", head: true }).eq("number", p.number);
  if (e1) return { status: "error", message: "Could not check the database. Please try again.", values: p.values };
  if (count) return { status: "error", message: "A locomotive with that number already exists. Use Edit to request changes.", values: p.values, fieldErrors: { number: "This number is already in the database." } };
  const after: Snapshot = Object.fromEntries(Object.entries(snap).filter(([, v]) => v !== null)) as Snapshot;   // blank optional fields are simply not submitted
  const r = await submitRequest(admin.supabase, admin.user, "add", p.reason, [{ number: p.number, action: "add", after }]);
  return r.ok ? sent(r.id, p.values) : { status: "error", message: r.message, values: p.values };
}

export async function updateLoco(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await getAdmin(); if (!admin) return DENIED;
  const p = parseLocoForm(fd);
  if (!p.ok) return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: p.fieldErrors, values: p.values };
  const after = toSnapshot(p.value, await formOptions(admin.supabase), true); if (!after) return { ...BAD_REF, values: p.values };
  let before: Snapshot | undefined;
  try { before = (await fetchSnapshots(admin.supabase, [p.number])).get(p.number); } catch { return { status: "error", message: "Could not read the current record. Please try again.", values: p.values }; }
  if (!before) return { status: "error", message: "This locomotive no longer exists.", values: p.values };
  const keys = changedKeys(before, after);
  if (keys.length === 0) return { status: "error", message: "Nothing has changed compared with the current record.", values: p.values };
  const item: Item = { number: p.number, action: "update", mode: "edit", before, after: Object.fromEntries(keys.map(k => [k, norm(after[k])])) as Snapshot };
  const r = await submitRequest(admin.supabase, admin.user, "edit", p.reason, [item]);
  return r.ok ? sent(r.id, p.values) : { status: "error", message: r.message, values: p.values };
}
