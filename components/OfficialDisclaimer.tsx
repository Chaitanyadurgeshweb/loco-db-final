import { DISCLAIMER_BEFORE_URL, OFFICIAL_URL } from "@/lib/site";
export default function OfficialDisclaimer({ short = false }: { short?: boolean }) {
  if (short) return <p>Independent, unofficial project: not affiliated with, endorsed by, sponsored by, or operated by Indian Railways or any government authority. Official website: <a href={OFFICIAL_URL} rel="noopener noreferrer" className="text-white underline">indianrailways.gov.in</a>.</p>;
  return <p className="notice notice-warn font-medium" role="note">{DISCLAIMER_BEFORE_URL}<a href={OFFICIAL_URL} rel="noopener noreferrer">{OFFICIAL_URL}</a>.</p>;
}
