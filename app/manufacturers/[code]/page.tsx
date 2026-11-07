import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import ListedLocos from "@/components/ListedLocos"; import PageHeader from "@/components/PageHeader";
export async function generateMetadata({ params }: { params: { code: string } }) { return { title: `Manufacturer ${params.code}` }; }
export default async function Detail({ params, searchParams }: { params: { code: string }; searchParams: { page?: string } }) {
  const { data: r } = await db.from("manufacturers").select("*").eq("code", params.code).maybeSingle();
  if (!r) notFound();
  return <><PageHeader title={r.name ?? r.code} crumbs={[{ label: "Manufacturers", href: "/manufacturers" }, { label: r.code }]}><p>Production unit code: <strong>{r.code}</strong></p></PageHeader>
    <h2 className="!mt-0">Locomotives listed</h2><ListedLocos base={`/manufacturers/${params.code}`} filters={{ mfr: r.code, page: Number(searchParams.page) || 1 }} /></>;
}
