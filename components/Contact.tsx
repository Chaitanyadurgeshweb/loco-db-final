import { CONTACT_EMAIL } from "@/lib/site";
export function Pending({ children = "Owner to confirm" }: { children?: React.ReactNode }) { return <span className="badge badge-disputed" title="Not yet confirmed by the project owner">{children}</span>; }
/** Real contact only: a mailto link when NEXT_PUBLIC_CONTACT_EMAIL is configured, otherwise an explicit "pending" notice. */
export default function Contact({ topic = "corrections and enquiries" }: { topic?: string }) {
  return CONTACT_EMAIL ? <p>For {topic}, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    : <p className="notice notice-warn"><Pending>Contact pending</Pending> A public contact address for {topic} has not been set up yet. Until the project owner publishes one, no correction or enquiry channel is available through this website.</p>;
}
