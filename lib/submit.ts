import type { SupabaseClient, User } from "@supabase/supabase-js";
import { notifyMaster } from "@/lib/email";
import type { Item, RequestType } from "@/lib/requests";

/** Files a request for Master Admin approval. The live locomotive tables are NOT touched: the database function only records the request. */
export async function submitRequest(sb: SupabaseClient, user: User, type: RequestType, reason: string, items: Item[],
  extra: { fileName?: string; summary?: Record<string, number> } = {}): Promise<{ ok: true; id: number } | { ok: false; message: string }> {
  const { data, error } = await sb.rpc("submit_change_request", { p_type: type, p_reason: reason, p_payload: { items, ...(extra.summary ? { summary: extra.summary } : {}) }, p_file_name: extra.fileName ?? null });
  if (error || typeof data !== "number") {
    console.error("submit_change_request", error?.code, error?.message);
    if (error?.code === "42501") return { ok: false, message: "Your account is not authorised to submit changes." };
    const m = /INVALID: (.+)/.exec(error?.message ?? "");
    return { ok: false, message: m ? m[1] : "The request could not be submitted. Please try again." };
  }
  await notifyMaster({ id: data, type, submittedBy: user.email ?? "unknown", submittedAt: new Date(), reason, items, fileName: extra.fileName, summary: extra.summary ?? null });
  return { ok: true, id: data };
}
