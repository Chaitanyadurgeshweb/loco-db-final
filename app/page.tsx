import Link from "next/link"; import { db, options, getCounts } from "@/lib/db";
export const revalidate = 3600;
export default async function Home() {
  const [{ classes, mfrs }, n, zr] = await Promise.all([options(), getCounts(), db.from("zones").select("code,name,locomotives(count)").order("code")]);
  const zones = (zr.data ?? []) as any[];
  const stats: [string, number | null, string][] = [["Locomotives", n.locomotives, "/search"], ["Classes", n.classes, "/locomotives"], ["Sheds", n.sheds, "/sheds"], ["Zones", n.zones, "/zones"], ["Manufacturers", n.manufacturers, "/manufacturers"]];
  return <>
    <section className="mb-8"><h1 className="text-3xl md:text-4xl">Indian Railways locomotive reference</h1>
      <p className="max-w-[680px] text-[15px] leading-[26px] text-gray-800">Loco Portal is an independent, searchable record of locomotives by number, class, shed, zone and production unit. Specifications and history are added only where a source is available, and every record shows its verification status.</p></section>
    <section aria-labelledby="stats" className="mb-8"><h2 id="stats" className="!mt-0">In the database now</h2>
      <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(([l, v, h]) => <div key={l} className="stat-card"><dd className="font-mono text-2xl font-bold text-gray-900 tabular-nums">{v === null ? "—" : v.toLocaleString()}</dd><dt className="text-sm"><Link href={h}>{l}</Link></dt></div>)}</dl></section>
    <section aria-labelledby="zones" className="mb-8"><h2 id="zones" className="!mt-0">Zones</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {zones.map(z => <li key={z.code}><Link href={`/zones/${z.code}`} className="zone-card"><span className="zone-badge">{z.code}</span>
          <span className="mt-2 block text-xs text-gray-600 leading-snug">{z.name}</span>
          <span className="mt-1 block font-mono text-lg font-bold">{(z.locomotives?.[0]?.count ?? 0).toLocaleString()} <span className="font-sans text-xs font-normal text-gray-600">locos</span></span></Link></li>)}</ul></section>
    <div className="grid md:grid-cols-2 gap-x-10">
      <section><h2 className="!mt-0">Locomotive classes</h2><p className="chip-list">{classes.map(c => <Link key={c.slug} href={`/locomotives/${c.slug}`}>{c.code}</Link>)}</p></section>
      <section><h2 className="!mt-0">Manufacturers</h2><p className="chip-list">{mfrs.map(m => <Link key={m.code} href={`/manufacturers/${m.code}`}>{m.code}</Link>)}</p></section></div>
    <p className="notice mt-8">Records are informational and may be incomplete or out of date. See <Link href="/about#limitations">Limitations</Link> and <Link href="/sources">Data status</Link>.</p></>;
}
