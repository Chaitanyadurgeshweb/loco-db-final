import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import ListedLocos from "@/components/ListedLocos"; import PageHeader from "@/components/PageHeader";
export async function generateMetadata({ params }: { params: { code: string } }) { return { title: `Shed ${params.code}` }; }
export default async function Detail({ params, searchParams }: { params: { code: string }; searchParams: { page?: string } }) {
  const { data: r } = await db.from("sheds").select("*").eq("code", params.code).maybeSingle();
  if (!r) notFound();
  return <><PageHeader title={r.name ?? r.code} crumbs={[{ label: "Sheds", href: "/sheds" }, { label: r.code }]}><p>Shed code: <strong>{r.code}</strong>{r.location ? <> · {r.location}</> : null}</p></PageHeader>
    <h2 className="!mt-0">Locomotives allocated</h2><ListedLocos base={`/sheds/${params.code}`} filters={{ shed: r.code, page: Number(searchParams.page) || 1 }} /></>;
}
