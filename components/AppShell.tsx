"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/site";

type Item = { label: string; href: string; exact?: boolean; also?: string[] };
const PUBLIC: Item[] = [
  { label: "Home", href: "/", exact: true }, { label: "Locomotives", href: "/search", also: ["/locos"] }, { label: "Classes", href: "/locomotives" },
  { label: "Zones", href: "/zones" }, { label: "Sheds", href: "/sheds" }, { label: "Manufacturers", href: "/manufacturers" },
  { label: "Data status", href: "/sources" }, { label: "About", href: "/about" }, { label: "login", href: "/admin" }];
const ADMIN: Item[] = [
  { label: "Dashboard", href: "/admin", exact: true }, { label: "Locomotives", href: "/admin/locos" }, { label: "Add locomotive", href: "/admin/locos/new" },
  { label: "Bulk upload", href: "/admin/bulk" }, { label: "View public site", href: "/", exact: true }, { label: "Master Administration login", href: "/master" }];
const MASTER: Item[] = [
  { label: "Approval Dashboard", href: "/master" }, { label: "Manage Administrators", href: "/master/admins" }, { label: "View Public Site", href: "/", exact: true }, { label: "Administration", href: "/admin" }];

const AREAS = {
  public: { label: "Reference", items: PUBLIC, primary: 4 },
  admin: { label: "Administrator", items: ADMIN, primary: 4 },
  master: { label: "Master Admin", items: MASTER, primary: 3 },
} as const;

function areaOf(path: string): keyof typeof AREAS {
  if (path.startsWith("/master") && path !== "/master/login") return "master";
  if (path.startsWith("/admin") && path !== "/admin/login") return "admin";
  return "public";
}
function activeOf(items: readonly Item[], path: string): Item | undefined {
  const hit = (i: Item) => [i.href, ...(i.also ?? [])].some(h => path === h || (!i.exact && h !== "/" && path.startsWith(h + "/")));
  return items.filter(hit).sort((a, b) => b.href.length - a.href.length)[0];
}

export default function AppShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const path = usePathname() || "/";
  const [more, setMore] = useState(false);
  const area = AREAS[areaOf(path)], items = area.items, active = activeOf(items, path);
  const key = areaOf(path), isMaster = key === "master";
  const side = "block rounded-industrial px-3 py-2.5 text-sm font-medium no-underline hover:no-underline ";
  const primary = items.slice(0, area.primary), rest = items.slice(area.primary);
  const dock = "flex-1 min-h-[56px] flex items-center justify-center px-1 text-center text-xs font-semibold no-underline hover:no-underline border-t-2 ";
  return <div className="min-h-screen md:flex">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-[60] focus:top-2 focus:left-2 focus:bg-surface focus:text-slate-100 focus:px-3 focus:py-2 focus:rounded">Skip to main content</a>
    <aside className="hidden md:flex md:w-[200px] lg:w-[220px] shrink-0 sticky top-0 h-screen flex-col border-r border-line bg-surface p-3">
      <Link href="/" className="flex items-center gap-2.5 px-2 pt-1 pb-4 text-white no-underline hover:no-underline"><span aria-hidden="true" className="h-7 w-7 rounded-industrial bg-accent" /><span className="font-extrabold">{SITE_NAME}</span></Link>
      <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-600">{area.label}</p>
      <nav aria-label="Main"><ul className="space-y-1">{items.map(i => <li key={i.label}><Link href={i.href} aria-current={i === active ? "page" : undefined}
        className={side + (i === active ? "bg-navy-800 text-white" : "text-gray-600 hover:bg-elevated hover:text-gray-900")}>{i.label}</Link></li>)}</ul></nav>
    </aside>
    <div className="flex-1 min-w-0 flex flex-col min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="sticky top-0 z-30 bg-navy border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 px-4 md:px-6 h-14 md:h-16">
          <Link href="/" className="md:hidden font-extrabold text-white no-underline hover:no-underline">{SITE_NAME}</Link>
          {!isMaster && <form action="/search" role="search" className="flex flex-1 max-w-xl gap-2 ml-auto md:ml-0">
            <label htmlFor="site-q" className="sr-only">Search locomotives, classes or sheds</label>
            <input id="site-q" name="q" placeholder="Loco no., class or shed" className="input !min-h-[40px] !py-1.5" />
            <button className="btn btn-primary !min-h-[40px]">Search</button></form>}
          {isMaster && <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-600">Master control</span>}
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 focus:outline-none">{children}</main>
      {key === "public" ? footer : null}
    </div>
    <nav aria-label="Primary" className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
      {more && <ul className="absolute bottom-full right-2 mb-2 w-52 rounded-card border border-line bg-elevated p-1 shadow-2xl">
        {rest.map(i => <li key={i.label}><Link href={i.href} onClick={() => setMore(false)} className="block rounded-industrial px-3 py-3 text-sm text-gray-900 no-underline hover:bg-surface hover:no-underline">{i.label}</Link></li>)}</ul>}
      <div className="flex">{primary.map(i => <Link key={i.label} href={i.href} onClick={() => setMore(false)} aria-current={i === active ? "page" : undefined}
        className={dock + (i === active ? "border-accent text-white" : "border-transparent text-gray-600")}>{i.label}</Link>)}
        <button type="button" aria-expanded={more} onClick={() => setMore(v => !v)} className={dock + "border-transparent text-gray-600"}>More</button></div>
    </nav>
  </div>;
}
