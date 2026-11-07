import type { SupabaseClient } from "@supabase/supabase-js";
import { VERIFICATION_LABEL } from "@/lib/format";

/** Locomotive fields that can be submitted. Reference fields (class, shed, zone, manufacturer) travel as their codes. */
export const FIELD_KEYS = ["class", "shed", "zone", "manufacturer", "kavach_make", "service_status", "verification", "last_verified", "archived"] as const;
export type FieldKey = (typeof FIELD_KEYS)[number];
export const FIELD_LABEL: Record<FieldKey, string> = { class: "Class", shed: "Shed", zone: "Zone", manufacturer: "Manufacturer / builder", kavach_make: "Kavach make",
  service_status: "Service status", verification: "Verification status", last_verified: "Last verified", archived: "Archived" };
export type Val = string | boolean | null;
export type Snapshot = Partial<Record<FieldKey, Val>>;
export type Item = { number: number; action: "add" | "update"; mode?: "edit" | "fill_missing"; before?: Snapshot; after: Snapshot };
export type RequestType = "add" | "edit" | "bulk_upload";
export type RequestStatus = "pending" | "approved" | "declined";
export const TYPE_LABEL: Record<RequestType, string> = { add: "Add locomotive", edit: "Edit locomotive", bulk_upload: "Bulk upload" };
export const reqId = (id: number | string) => `REQ-${String(id).padStart(6, "0")}`;

export function norm(v: unknown): Val {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return v;
  const s = String(v).trim(); return s === "" ? null : s;
}
export function show(k: FieldKey, v: Val | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return k === "verification" ? (VERIFICATION_LABEL[v] ?? v) : v;
}
export function changedKeys(before: Snapshot, after: Snapshot): FieldKey[] {
  return FIELD_KEYS.filter(k => k in after && norm(after[k]) !== norm(before[k]));
}

const SELECT = "number,kavach_make,service_status,verification,last_verified,archived,loco_classes(code),sheds(code),zones(code),manufacturers(code)";
/** Current live values (as codes) for the given locomotive numbers. Runs as the signed-in user, so RLS decides what is visible. */
export async function fetchSnapshots(sb: SupabaseClient, numbers: number[]): Promise<Map<number, Snapshot>> {
  const out = new Map<number, Snapshot>();
  for (let i = 0; i < numbers.length; i += 200) {
    const { data, error } = await sb.from("locomotives").select(SELECT).in("number", numbers.slice(i, i + 200));
    if (error) throw new Error("Could not read locomotive records");
    for (const r of (data ?? []) as any[]) out.set(r.number, { class: r.loco_classes?.code ?? null, shed: r.sheds?.code ?? null, zone: r.zones?.code ?? null,
      manufacturer: r.manufacturers?.code ?? null, kavach_make: r.kavach_make ?? null, service_status: r.service_status ?? null,
      verification: r.verification ?? null, last_verified: r.last_verified ?? null, archived: !!r.archived });
  }
  return out;
}
