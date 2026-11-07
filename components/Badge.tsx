import { VERIFICATION_LABEL } from "@/lib/format";
/** Status is always shown as text as well as colour. */
export function VerificationBadge({ status }: { status: string | null | undefined }) {
  const s = status && status in VERIFICATION_LABEL ? status : "unverified";
  return <span className={`badge badge-${s}`}>{VERIFICATION_LABEL[s]}</span>;
}
export function ArchivedBadge() { return <span className="badge badge-archived">Archived (hidden)</span>; }
