import type { RequestStatus } from "@/lib/requests";
const L: Record<RequestStatus, string> = { pending: "Pending", approved: "Approved", declined: "Declined" };
export default function StatusBadge({ status }: { status: RequestStatus }) { return <span className={`badge badge-${status}`}>{L[status]}</span>; }
