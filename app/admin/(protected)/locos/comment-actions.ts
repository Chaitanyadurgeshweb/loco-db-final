"use server";
import { revalidatePath } from "next/cache"; import { getAdmin } from "@/lib/auth"; import type { FormState } from "@/lib/loco-schema";

export async function addComment(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await getAdmin(); if (!admin) return { status: "error", message: "You are not signed in as an administrator. Sign in again." };
  const raw = String(fd.get("number") ?? ""), comment = String(fd.get("comment") ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").trim();
  if (!/^\d{5}$/.test(raw)) return { status: "error", message: "Invalid locomotive number." };
  if (!comment) return { status: "error", message: "Write a comment first.", values: { comment } };
  if (comment.length > 2000) return { status: "error", message: "Use 2000 characters or fewer.", values: { comment } };
  const { error } = await admin.supabase.rpc("add_loco_comment", { p_number: Number(raw), p_comment: comment });
  if (error) { console.error("add_loco_comment", error.code); return { status: "error", message: "The comment could not be saved. Please try again.", values: { comment } }; }
  revalidatePath(`/admin/locos/${raw}/edit`);
  return { status: "success", message: "Comment added.", values: { comment: "" } };
}
