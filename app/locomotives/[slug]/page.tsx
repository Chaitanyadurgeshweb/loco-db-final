import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import ListedLocos from "@/components/ListedLocos"; import PageHeader from "@/components/PageHeader"; import { na } from "@/lib/format";
export async function generateMetadata({ params }: { params: { slug: string } }) { return { title: `Class ${params.slug.toUpperCase()}` }; }
export default async function ClassPage({ params, searchParams }: { params: { slug: string }; searchParams: { page?: string } }) {
  const { data: c } = await db.from("loco_classes").select("code,traction,gauge,service_type,overview,history,specs").eq("slug", params.slug).maybeSingle();
  if (!c) notFound();
  const specs = Object.entries((c.specs ?? {}) as Record<string, unknown>);
  return <><PageHeader title={`Indian Railways class ${c.code}`} crumbs={[{ label: "Classes", href: "/locomotives" }, { label: c.code }]} />
    <h2 className="!mt-0">Class summary</h2>
    <table className="kv-table"><tbody><tr><th scope="row">Traction</th><td>{na(c.traction)}</td></tr><tr><th scope="row">Gauge</th><td>{na(c.gauge)}</td></tr><tr><th scope="row">Service</th><td>{na(c.service_type)}</td></tr></tbody></table>
    {specs.length > 0 && <><h2>Specifications</h2><table className="kv-table"><tbody>{specs.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{na(v)}</td></tr>)}</tbody></table></>}
    <h2>Overview and history</h2><div className="prose-doc"><p>{na(c.overview)}</p>{c.history ? <p>{na(c.history)}</p> : null}</div>
    <h2>Locomotives listed in this class</h2><ListedLocos base={`/locomotives/${params.slug}`} filters={{ cls: c.code, page: Number(searchParams.page) || 1 }} />
    <p className="text-xs text-gray-700 mt-6">Source: supplied records (unverified against official records).</p></>;
}
