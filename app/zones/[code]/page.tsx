import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import ListedLocos from "@/components/ListedLocos"; import PageHeader from "@/components/PageHeader";
export async function generateMetadata({ params }: { params: { code: string } }) { return { title: `Zone ${params.code}` }; }
export default async function Detail({ params, searchParams }: { params: { code: string }; searchParams: { page?: string } }) {
  const { data: r } = await db.from("zones").select("*").eq("code", params.code).maybeSingle();
  if (!r) notFound();
  return <><PageHeader title={r.name ?? r.code} crumbs={[{ label: "Zones", href: "/zones" }, { label: r.code }]}><p>Zone code: <strong>{r.code}</strong></p></PageHeader>
    <h2 className="!mt-0">Locomotives recorded in this zone</h2><ListedLocos base={`/zones/${params.code}`} filters={{ zone: r.code, page: Number(searchParams.page) || 1 }} /></>;
}
