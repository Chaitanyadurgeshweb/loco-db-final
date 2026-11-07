import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
const nav: [string, string][] = [["Home", "/"], ["Locomotives", "/search"], ["Classes", "/locomotives"], ["Sheds", "/sheds"], ["Zones", "/zones"],
  ["Manufacturers", "/manufacturers"], ["Data status", "/sources"], ["About", "/about"]];
export default function SiteHeader() {
  const links = nav.map(([n, h]) => <li key={h}><Link href={h} className="block py-2 md:py-2.5 text-gray-100 hover:text-white">{n}</Link></li>);
  return <header className="bg-navy text-white">
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:text-navy focus:px-3 focus:py-2">Skip to main content</a>
    <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
      <Link href="/" className="text-white hover:no-underline leading-tight"><span className="block text-xl font-bold tracking-tight">{SITE_NAME}</span>
        <span className="block text-xs text-gray-300">{SITE_TAGLINE}</span></Link>
      <form action="/search" role="search" className="flex gap-2 w-full sm:w-auto sm:ml-auto">
        <label htmlFor="site-q" className="sr-only">Search locomotives, classes or sheds</label>
        <input id="site-q" name="q" placeholder="Loco no., class or shed" className="input sm:w-64 !border-transparent" />
        <button className="btn !bg-rail !border-rail !text-white hover:!bg-red-900">Search</button></form>
    </div>
    <nav aria-label="Main" className="bg-navy-800 border-t border-white/15"><div className="container-page text-sm">
      <ul className="hidden md:flex flex-wrap gap-x-6">{links}</ul>
      <details className="md:hidden"><summary className="cursor-pointer py-2.5 font-medium">Menu</summary><ul className="pb-2">{links}</ul></details>
    </div></nav></header>;
}
