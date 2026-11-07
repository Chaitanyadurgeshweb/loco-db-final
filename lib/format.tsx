import type { ReactNode } from "react";
/** Renders a nullable DB value as text, or a visible "Not available". Always returns a valid ReactNode. */
export function na(v: unknown): ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-gray-600">Not available</span>;
  if (typeof v === "string" || typeof v === "number") return String(v);
  return <span className="text-gray-600">Not available</span>;
}
export const VERIFICATION_LABEL: Record<string, string> = {
  unverified: "Unverified", source_listed: "Source listed", verified: "Verified", disputed: "Disputed" };
export function formatDate(v: unknown): string {
  if (typeof v !== "string" || !v) return "—";
  const d = new Date(v); return isNaN(d.getTime()) ? "—" : d.toISOString().slice(0, 10);
}
