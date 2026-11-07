import Link from "next/link"; import PageHeader from "@/components/PageHeader"; import OfficialDisclaimer from "@/components/OfficialDisclaimer"; import Contact, { Pending } from "@/components/Contact";
export const metadata = { title: "Legal information" };
const toc: [string, string][] = [["copy", "Copyright"], ["sub", "Submitted material"], ["warr", "No warranty"], ["ref", "References"], ["off", "No official status"], ["liab", "No liability"],
  ["other", "Other entities"], ["priv", "Privacy"], ["accuracy", "Data accuracy and corrections"], ["licenses", "Third-party software and licences"], ["takedown", "Intellectual property and takedown requests"], ["contact", "Contact and legal enquiries"]];
export default function Legal() { return <><PageHeader title="Legal information" crumbs={[{ label: "Legal information" }]}>
  <p>General terms for using Loco Portal. This is plain-language website documentation, not legal advice and not a guarantee of legal compliance. Items marked <Pending /> need confirmation from the project owner.</p></PageHeader>
  <nav aria-label="On this page" className="border border-gray-200 bg-gray-50 p-4 mb-6 max-w-3xl"><p className="font-semibold text-navy mb-2">Contents</p>
    <ol className="list-decimal pl-5 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">{toc.map(([id, t]) => <li key={id}><a href={`#${id}`}>{t}</a></li>)}</ol></nav>
  <div className="prose-doc [&_section]:scroll-mt-4">
  <section id="copy"><h2>1. Copyright</h2>
    <p>Ownership of original content on this site depends on the rights and agreements that apply to each item. Loco Portal does not claim ownership of third-party photographs, text, logos, datasets, diagrams or trademarks, and respects the licences and permissions attached to them. Names such as “Indian Railways”, locomotive class names and production-unit names belong to their respective owners and are used here only to identify things.</p>
    <p><Pending /> The project owner should state who holds copyright in the original text and in the compiled database, and under what licence (if any) others may reuse it. Until then, no reuse licence is granted beyond what applicable law allows.</p></section>
  <section id="sub"><h2>2. Submitted material</h2>
    <p>Submitting information, corrections or images does not transfer ownership or copyright to the project. Material will be published only if the project has the necessary rights or permission to do so. A formal contribution policy (what licence contributors grant) has not yet been established <Pending />, and no public submission form currently exists.</p></section>
  <section id="warr"><h2>3. No warranty</h2>
    <p>The information on this site is provided “as is” for general informational and reference purposes. It is not guaranteed to be complete, current, accurate or free of errors, and may change or be removed without notice. Do not use it for operational, maintenance or safety-critical decisions.</p></section>
  <section id="ref"><h2>4. References</h2>
    <p>The initial locomotive data is compiled from supplied records and has not been independently verified (see <Link href="/sources">Data status</Link> and <Link href="/acknowledgements">Acknowledgements</Link>). References are listed only where they are known. No organisation has reviewed or verified the content of this site.</p></section>
  <section id="off"><h2>5. No official status</h2><OfficialDisclaimer />
    <p>This site does not use Indian Railways logos or design elements and is not meant to look official. Nothing here is an official notice, timetable, order or record. The site is also not affiliated with the Indian Railways Fan Club Association (IRFCA).</p></section>
  <section id="liab"><h2>6. No liability</h2>
    <p>To the fullest extent permitted by applicable law, the project owner is not liable for loss or damage arising from the use of, or inability to use, this site or from reliance on its content. Nothing in these terms excludes or limits any liability that cannot be excluded or limited by law. <Pending>Governing law and jurisdiction to be confirmed</Pending></p></section>
  <section id="other"><h2>7. Other entities</h2>
    <p>Links to other websites, including the official Indian Railways website, are provided for convenience and reference. They do not mean that Loco Portal endorses those sites or that they endorse Loco Portal, and Loco Portal is not responsible for their content or privacy practices.</p></section>
  <section id="priv"><h2>8. Privacy</h2>
    <p>Visitors do not need an account, and the site’s code includes no analytics, advertising or tracking scripts. Administrator accounts and the service providers that operate the site do process some personal data. Read the full <Link href="/privacy">Privacy statement</Link>.</p></section>
  <section id="accuracy"><h2>9. Data accuracy and corrections</h2>
    <p>Each locomotive record shows a verification status: <em>verified</em>, <em>source listed</em>, <em>unverified</em> or <em>disputed</em>. “Source listed” means the record comes from supplied records and has not been independently checked. Locomotives are reallocated and renumbered, so records can become outdated. If you find an error, report it using the contact route below, saying which locomotive and what a reliable source shows. Reported errors are reviewed by the maintainer; no response time is promised.</p><Contact topic="corrections" /></section>
  <section id="licenses"><h2>10. Third-party software and licences</h2>
    <p>The site is built with open-source packages (Next.js, React, Tailwind CSS, TypeScript and others) under MIT or Apache-2.0 licences, listed on the <Link href="/acknowledgements#software">Acknowledgements</Link> page. Their licences apply to those packages only. Using them does not make Loco Portal’s own code, text or data open source.</p></section>
  <section id="takedown"><h2>11. Intellectual property and takedown requests</h2>
    <p>If you are a rights holder and believe content on this site infringes your rights, send a notice containing: your name and contact details; a description of the work; the exact page address where the material appears; a statement of why you believe the use is not authorised; and a statement that the information is accurate. Notices are reviewed by the maintainer, and content may be removed or hidden while a notice is assessed. Sending a notice does not mean a claim has been accepted or resolved. <Pending>Owner to confirm process and contact</Pending></p><Contact topic="takedown notices" /></section>
  <section id="contact"><h2>12. Contact and legal enquiries</h2>
    <Contact topic="legal enquiries, corrections and privacy requests" />
    <p>The project owner’s name and any postal or registered address have not been published. <Pending /></p></section></div></>; }
