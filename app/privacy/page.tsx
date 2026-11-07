import Link from "next/link"; import PageHeader from "@/components/PageHeader"; import Contact, { Pending } from "@/components/Contact";
export const metadata = { title: "Privacy" };
export default function Privacy() { return <><PageHeader title="Privacy" crumbs={[{ label: "Privacy" }]}>
  <p>This describes what the Loco Portal application does today. It was written from the application’s code and is general documentation, not legal advice. Items marked <Pending /> need confirmation from the project owner.</p></PageHeader>
  <div className="prose-doc">
  <h2 id="visitors">Visitors</h2>
  <ul><li>You do not need an account to browse. The public pages set no cookies and the application includes no analytics, advertising or tracking code.</li>
  <li>Searches are sent as part of the page address (for example <code>/search?q=3045</code>), so what you search for appears in the address and in hosting logs.</li>
  <li>The application stores nothing about visitors in its own database. It only reads locomotive records.</li></ul>
  <h2 id="hosting">Service providers</h2>
  <ul><li>The site is operated using third-party service providers for hosting and data storage. Like most providers they may log technical request details such as IP address, browser type, requested address and time. Page data is requested by the application’s server, not directly from your browser.</li></ul>
  <h2 id="admin">Administrator accounts</h2>
  <ul><li>Only invited administrators can sign in. There is no public registration.</li>
  <li>The sign-in service stores each administrator’s email address and a hashed password, and may record sign-in events. The application never sees or stores plaintext passwords.</li>
  <li>After sign-in, session cookies (names starting <code>sb-</code>, ending <code>-auth-token</code>) are set. They are strictly necessary to keep you signed in, are not readable by page scripts, and are only used on the administration area.</li>
  <li>Changes to locomotive records are submitted for review. The application keeps an audit history of each submission and decision, including the administrator’s account email and the time.</li></ul>
  <h2 id="retention">Retention</h2>
  <p>The application sets no retention periods of its own. Log and account retention is governed by the service providers’ own settings and policies. <Pending>Owner to confirm retention periods</Pending></p>
  <h2 id="rights">Access, correction and deletion</h2>
  <p>Depending on where you live, data-protection law may give you rights over personal data held about you. Administrators can ask for their account to be changed or removed; the project owner can do this directly. For other requests, contact the project owner. Because no visitor data is stored by the application itself, most requests will concern hosting logs held by the providers above.</p>
  <h2 id="contact">Contact</h2><Contact topic="privacy enquiries" />
  <p>Related: <Link href="/legal">Legal information</Link>.</p></div></>; }
