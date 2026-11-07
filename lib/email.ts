import nodemailer from "nodemailer";
import { FIELD_LABEL, TYPE_LABEL, changedKeys, reqId, show, type Item, type RequestType } from "@/lib/requests";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export type Notice = { id: number; type: RequestType; submittedBy: string; submittedAt: Date; reason: string; items: Item[]; fileName?: string | null; summary?: Record<string, number> | null };
const MAX_ROWS = 25;

/** Sends the approval notification. Never throws: a mail problem must not undo or block a submission. Returns whether a message was sent. */
export async function notifyMaster(n: Notice): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, MASTER_ADMIN_NOTIFY_EMAIL, SITE_URL } = process.env;
  if (!SMTP_USER || !SMTP_PASS || !MASTER_ADMIN_NOTIFY_EMAIL || !SITE_URL) { console.warn("notifyMaster: email is not configured; skipped"); return false; }
  const base = `${SITE_URL.replace(/\/+$/, "")}/master/requests/${n.id}`;
  const nums = n.items.map(i => i.number);
  const rows: string[] = [], text: string[] = [];
  for (const it of n.items.slice(0, MAX_ROWS)) {
    const keys = it.action === "add" ? (Object.keys(it.after) as (keyof typeof FIELD_LABEL)[]) : changedKeys(it.before ?? {}, it.after);
    for (const k of keys) {
      const prev = it.action === "add" ? "—" : show(k, it.before?.[k]), next = show(k, it.after[k]);
      rows.push(`<tr><td>${it.number}</td><td>${esc(FIELD_LABEL[k])}</td><td style="color:#991b1b">${esc(prev)}</td><td style="color:#166534"><b>${esc(next)}</b></td></tr>`);
      text.push(`${it.number} | ${FIELD_LABEL[k]} | ${prev} -> ${next}`);
    }
  }
  const more = n.items.length > MAX_ROWS ? `<p>Showing the first ${MAX_ROWS} of ${n.items.length} locomotives. Open the preview for the full list.</p>` : "";
  const sum = n.summary ? `<p><b>Upload summary:</b> ${Object.entries(n.summary).map(([k, v]) => `${esc(k)}: ${v}`).join(" · ")}</p>` : "";
  const btn = (href: string, label: string, bg: string) => `<a href="${esc(href)}" style="display:inline-block;padding:10px 18px;margin-right:8px;background:${bg};color:#fff;text-decoration:none;border-radius:4px;font-weight:600">${label}</a>`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:680px;color:#111">
<h2 style="color:#14213d">Approval needed: ${reqId(n.id)}</h2>
<table cellpadding="4" style="border-collapse:collapse;font-size:14px">
<tr><td><b>Request ID</b></td><td>${reqId(n.id)}</td></tr><tr><td><b>Type</b></td><td>${esc(TYPE_LABEL[n.type])}</td></tr>
<tr><td><b>Submitted by</b></td><td>${esc(n.submittedBy)}</td></tr>
<tr><td><b>Submitted</b></td><td>${esc(n.submittedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))} IST</td></tr>
<tr><td><b>Locomotives</b></td><td>${esc(nums.slice(0, 20).join(", "))}${nums.length > 20 ? ` … (+${nums.length - 20} more)` : ""}</td></tr>
${n.fileName ? `<tr><td><b>File</b></td><td>${esc(n.fileName)}</td></tr>` : ""}
<tr><td valign="top"><b>Reason</b></td><td>${esc(n.reason)}</td></tr></table>${sum}
<table border="1" cellpadding="6" style="border-collapse:collapse;font-size:13px;margin:12px 0;border-color:#ccc"><tr style="background:#f3f4f6"><th>Loco</th><th>Field</th><th>Previous</th><th>Proposed</th></tr>${rows.join("")}</table>${more}
<p>${btn(`${base}?action=approve`, "Approve", "#166534")}${btn(`${base}?action=decline`, "Decline", "#991b1b")}${btn(base, "Preview changes", "#14213d")}</p>
<p style="font-size:12px;color:#555">These links open the Master Admin dashboard. You must sign in as a Master Admin and confirm; nothing is approved or declined by opening a link.</p></div>`;
  try {
    const port = Number(SMTP_PORT ?? 465);
    const t = nodemailer.createTransport({ host: SMTP_HOST ?? "smtp.gmail.com", port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
    await t.sendMail({ from: SMTP_FROM || SMTP_USER, to: MASTER_ADMIN_NOTIFY_EMAIL, subject: `[Loco Portal] ${reqId(n.id)} – ${TYPE_LABEL[n.type]} – approval needed`,
      html, text: `Approval needed: ${reqId(n.id)}\nType: ${TYPE_LABEL[n.type]}\nSubmitted by: ${n.submittedBy}\nReason: ${n.reason}\n\n${text.join("\n")}\n\nPreview: ${base}\nApprove: ${base}?action=approve\nDecline: ${base}?action=decline\n` });
    return true;
  } catch (e) { console.error("notifyMaster failed", (e as Error).message); return false; }
}
