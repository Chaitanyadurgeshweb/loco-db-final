import { CONTACT_EMAIL } from "@/lib/site";

export default function Contact({
  topic = "corrections and enquiries",
}: {
  topic?: string;
}) {
  return (
    <p>
      For {topic}, contact us at{" "}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="text-blue-600 underline"
      >
        {CONTACT_EMAIL}
      </a>.
    </p>
  );
}
