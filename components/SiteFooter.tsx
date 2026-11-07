import Link from "next/link";
import OfficialDisclaimer from "./OfficialDisclaimer";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
const links: [string, string][] = [["About", "/about"], ["Data status", "/sources"], ["Acknowledgements", "/acknowledgements"], ["Legal Information", "/legal"], ["Privacy", "/privacy"], ["Admin Login", "/admin/login"]];
export default function SiteFooter() {
  return <footer className="site-footer bg-navy text-gray-200 mt-12 text-sm"><div className="container-page py-6 grid gap-6 md:grid-cols-3">
    <div><p className="font-semibold text-white">{SITE_NAME}</p><p className="mt-1">A structured, searchable reference to Indian Railways locomotives, sheds, zones and production units. Records marked “source listed” are not independently verified.</p></div>
    <nav aria-label="Footer"><ul className="grid grid-cols-2 gap-y-1">{links.map(([n, h]) => <li key={h}><Link href={h} className="text-white">{n}</Link></li>)}
      <li>{CONTACT_EMAIL ? <a href={`mailto:${CONTACT_EMAIL}`} className="text-white">Contact</a> : <Link href="/legal#contact" className="text-white">Contact (pending)</Link>}</li></ul></nav>
    <div className="text-xs"><OfficialDisclaimer short /></div></div></footer>;
}
