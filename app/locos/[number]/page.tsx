import Link from "next/link"; import { notFound } from "next/navigation"; import { db } from "@/lib/db";
import PageHeader from "@/components/PageHeader"; import { VerificationBadge } from "@/components/Badge"; import { na, formatDate } from "@/lib/format";
export async function generateMetadata({ params }: { params: { number: string } }) { return { title: `Loco ${params.number}` }; }
export default async function Loco({ params }: { params: { number: string } }) {
  if (!/^\d{5}$/.test(params.number)) notFound();
  const { data: l } = await db.from("locomotives").select("number,kavach_make,service_status,verification,last_verified,loco_classes(code,slug),sheds(code,name,location),zones(code,name),manufacturers(code)").eq("number", Number(params.number)).maybeSingle();
  if (!l) notFound();
  const x = l as any;
  return <><PageHeader title={`Locomotive ${x.number}`} crumbs={[{ label: "Locomotives", href: "/search" }, { label: String(x.number) }]} />
    <div className="grid lg:grid-cols-2 gap-x-10">
      <section aria-labelledby="h-id"><h2 id="h-id" className="!mt-0">Identification</h2><table className="kv-table"><tbody>
        <tr><th scope="row">Number</th><td className="tabular-nums">{x.number}</td></tr>
        <tr><th scope="row">Class</th><td>{x.loco_classes ? <Link href={`/locomotives/${x.loco_classes.slug}`}>{x.loco_classes.code}</Link> : na(null)}</td></tr>
        <tr><th scope="row">Builder</th><td>{x.manufacturers ? <Link href={`/manufacturers/${x.manufacturers.code}`}>{x.manufacturers.code}</Link> : na(null)}</td></tr></tbody></table></section>
      <section aria-labelledby="h-alloc"><h2 id="h-alloc" className="!mt-0 lg:!mt-0">Allocation</h2><table className="kv-table"><tbody>
        <tr><th scope="row">Shed</th><td>{x.sheds ? <><Link href={`/sheds/${x.sheds.code}`}>{x.sheds.name}</Link> ({x.sheds.code})</> : na(null)}</td></tr>
        <tr><th scope="row">Shed location</th><td>{na(x.sheds?.location)}</td></tr>
        <tr><th scope="row">Zone</th><td>{x.zones ? <Link href={`/zones/${x.zones.code}`}>{x.zones.name}</Link> : na(null)}</td></tr></tbody></table></section></div>
    <div className="grid lg:grid-cols-2 gap-x-10">
      <section aria-labelledby="h-eq"><h2 id="h-eq">Equipment and status</h2><table className="kv-table"><tbody>
        <tr><th scope="row">Kavach make</th><td>{na(x.kavach_make)}</td></tr><tr><th scope="row">Service status</th><td>{na(x.service_status)}</td></tr></tbody></table></section>
      <section aria-labelledby="h-ver"><h2 id="h-ver">Verification</h2><table className="kv-table"><tbody>
        <tr><th scope="row">Status</th><td><VerificationBadge status={x.verification} /></td></tr><tr><th scope="row">Last verified</th><td>{formatDate(x.last_verified)}</td></tr></tbody></table></section></div>
    <p className="notice mt-6">Allocation as listed in the supplied records; may be out of date. This is an informational record, not an operational source. <Link href="/about#limitations">Read the limitations</Link>.</p></>;
}
