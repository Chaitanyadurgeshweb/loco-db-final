import Link from "next/link"; import { options, textMatches } from "@/lib/db"; import ListedLocos from "@/components/ListedLocos"; import PageHeader from "@/components/PageHeader";
export const metadata = { title: "Search locomotives" };
type SP = { q?: string; cls?: string; zone?: string; shed?: string; mfr?: string; page?: string };
export default async function Search({ searchParams: sp }: { searchParams: SP }) {
  const { classes, zones, mfrs } = await options();
  const q = sp.q?.trim();
  const isNum = !!q && /^\d{1,5}$/.test(q);
  const text = q && !isNum ? await textMatches(q) : null;
  const sel = (name: string, label: string, val: string | undefined, opts: string[]) => <div><label htmlFor={`f-${name}`} className="label">{label}</label>
    <select id={`f-${name}`} name={name} defaultValue={val ?? ""} className="input"><option value="">All</option>{opts.map(o => <option key={o}>{o}</option>)}</select></div>;
  return <><PageHeader title="Search locomotives" crumbs={[{ label: "Locomotives" }]}><p>Search by number (full or partial), or narrow by class, zone, builder and shed. With no filters, all listed locomotives are shown.</p></PageHeader>
    <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end mb-6 p-4 bg-gray-50 border border-gray-200" role="search">
      <div className="lg:col-span-2"><label htmlFor="f-q" className="label">Number, class or shed</label><input id="f-q" name="q" defaultValue={q} placeholder="e.g. 3045, WAP-7, Tughlakabad" className="input" /></div>
      {sel("cls", "Class", sp.cls, classes.map(c => c.code))}{sel("zone", "Zone", sp.zone, zones.map(z => z.code))}{sel("mfr", "Builder", sp.mfr, mfrs.map(m => m.code))}
      <div><label htmlFor="f-shed" className="label">Shed code</label><input id="f-shed" name="shed" defaultValue={sp.shed} placeholder="e.g. TKD" className="input" /></div>
      <div className="sm:col-span-2 lg:col-span-6 flex gap-2"><button className="btn btn-primary">Apply filters</button><Link href="/search" className="btn">Clear</Link></div></form>
    {text && (text.classes.length > 0 || text.sheds.length > 0) && <p className="mb-3 text-sm chip-list"><span className="font-medium">Matches:</span>{text.classes.map(c => <Link key={c.slug} href={`/locomotives/${c.slug}`}>{c.code}</Link>)}{text.sheds.map(s => <Link key={s.code} href={`/sheds/${s.code}`}>{s.name}</Link>)}</p>}
    {text && !text.classes.length && !text.sheds.length ? <p className="notice">No class or shed matches “{q}”. Try a locomotive number (1–5 digits) or a class like WAP-7.</p>
      : (q && !isNum && !sp.cls && !sp.zone && !sp.shed && !sp.mfr) ? null : <ListedLocos base="/search" filters={{ q: isNum ? q : undefined, cls: sp.cls || undefined, zone: sp.zone || undefined, shed: sp.shed?.toUpperCase() || undefined, mfr: sp.mfr || undefined, page: Number(sp.page) || 1 }} />}</>;
}
