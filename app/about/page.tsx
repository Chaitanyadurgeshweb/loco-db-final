import Link from "next/link"; import PageHeader from "@/components/PageHeader"; import OfficialDisclaimer from "@/components/OfficialDisclaimer"; import Contact from "@/components/Contact";
export const metadata = { title: "About Loco Portal" };
export default function About() { return <><PageHeader title="About Loco Portal" crumbs={[{ label: "About" }]} />
  <div className="prose-doc">
  <OfficialDisclaimer />
  <h2 id="about">About Loco Portal</h2>
  <p>Loco Portal is a structured, searchable reference to Indian Railways locomotives. It exists so that a locomotive can be looked up by its number and followed to its class, shed, zone and production unit, instead of being buried in a spreadsheet. It is maintained as an independent project.</p>
  <h2 id="scope">Scope of information</h2>
  <p>The database holds the following, and nothing beyond it:</p>
  <ul><li><strong>Locomotives:</strong> five-digit number, class, home shed, zone as recorded for that locomotive, production unit or builder where known, Kavach make where listed, service status where listed, verification status and the date it was last verified.</li>
  <li><strong>Classes:</strong> class code, with fields for traction, gauge, service type, overview, history and technical specifications. These fields are filled in only where a source is available, so many class pages currently show “Not available”.</li>
  <li><strong>Sheds, zones and manufacturers:</strong> codes and names, plus a location for sheds.</li></ul>
  <p>Current totals are shown on the <Link href="/">home page</Link>. The database does not claim to list every locomotive.</p>
  <h2 id="audience">Intended audience</h2>
  <p>Railway enthusiasts, students, researchers and technical readers who want a quick, cross-linked lookup. The site is not intended for railway staff to use in their work, and its use does not imply any official endorsement.</p>
  <h2 id="data-sources">Data sources and verification</h2>
  <p>Locomotive records are compiled from supplied records and normalised before publication (see <Link href="/sources">Data status</Link>). Each record carries one of four verification statuses:</p>
  <ul><li><strong>Verified:</strong> checked against a source recorded by the maintainer.</li><li><strong>Source listed:</strong> compiled from supplied records and <em>not</em> independently checked. This is the status of the initial load.</li>
  <li><strong>Unverified:</strong> no source check has been made.</li><li><strong>Disputed:</strong> conflicting information exists and the record needs review.</li></ul>
  <p>Further details on who verified a “verified” record and against what source are not yet published. <span className="badge badge-disputed">Owner to confirm</span></p>
  <h2 id="limitations">Limitations</h2>
  <p>Records may be incomplete, out of date or wrong, and locomotives are reallocated, renumbered, transferred and withdrawn without notice. Loco Portal is an informational reference. <strong>Do not rely on it for operational instructions, maintenance, safety-critical or legal decisions.</strong> Always consult official Indian Railways sources for those.</p>
  <h2 id="corrections">Corrections and contact</h2>
  <Contact topic="corrections" />
  <p>See <Link href="/legal#accuracy">Data accuracy and corrections</Link>, <Link href="/acknowledgements">Acknowledgements</Link>, <Link href="/legal">Legal information</Link> and <Link href="/privacy">Privacy</Link>.</p></div></>; }
