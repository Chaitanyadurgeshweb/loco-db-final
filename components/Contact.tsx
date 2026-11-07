import { CONTACT_EMAIL } from "@/lib/site";

export default function Contact({
  topic = "corrections and enquiries",
}: {
  topic?: string;
}) {
  if (!CONTACT_EMAIL) {
    return null;
  }

  return (
    <p>
      For {topic}, email{"Chaitume0@gmail.com"}
      <a href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>.
    </p>
  );
}
