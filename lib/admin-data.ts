import type { SupabaseClient } from "@supabase/supabase-js";
import { PAGE_SIZE } from "@/lib/db";

export type AdminFilters = { q?: string; cls?: string; zone?: string; shed?: string; mfr?: string; state?: "active" | "archived"; page?: number };
export type AdminRow = { number: number; archived: boolean; verification: string; updated_at: string;
  loco_classes: { code: string }; sheds: { code: string }; zones: { code: string }; manufacturers: { code: string } | null };

/** Server-side filtering + pagination, run as the signed-in admin (RLS lets admins see archived rows). */
export async function adminSearch(sb: SupabaseClient, f: AdminFilters) {
  const mfrJoin = f.mfr ? "manufacturers!inner(code)" : "manufacturers(code)";
  let q = sb.from("locomotives").select(
    `number,archived,verification,updated_at,loco_classes!inner(code),sheds!inner(code),zones!inner(code),${mfrJoin}`, { count: "exact" });
  if (f.cls) q = q.eq("loco_classes.code", f.cls);
  if (f.shed) q = q.eq("sheds.code", f.shed);
  if (f.zone) q = q.eq("zones.code", f.zone);
  if (f.mfr) q = q.eq("manufacturers.code", f.mfr);
  if (f.state) q = q.eq("archived", f.state === "archived");
  const digits = f.q?.replace(/\D/g, "");
  if (digits && /^\d{1,5}$/.test(digits)) { const p = 10 ** (5 - digits.length), lo = Number(digits) * p; q = q.gte("number", Math.max(lo, 10000)).lt("number", lo + p); }
  const page = Math.max(1, f.page ?? 1), from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await q.order("number").range(from, from + PAGE_SIZE - 1);
  if (error) return { rows: [] as AdminRow[], total: 0, page, error: error.message };
  return { rows: (data ?? []) as unknown as AdminRow[], total: count ?? 0, page, error: null as string | null };
}

export async function formOptions(sb: SupabaseClient) {
  const [c, s, z, m] = await Promise.all([
    sb.from("loco_classes").select("id,code").order("code"), sb.from("sheds").select("id,code,name").order("code"),
    sb.from("zones").select("id,code,name").order("code"), sb.from("manufacturers").select("id,code,name").order("code")]);
  return { classes: (c.data ?? []) as { id: number; code: string }[], sheds: (s.data ?? []) as { id: number; code: string; name: string }[],
    zones: (z.data ?? []) as { id: number; code: string; name: string }[], manufacturers: (m.data ?? []) as { id: number; code: string; name: string | null }[] };
}
