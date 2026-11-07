import Link from "next/link"; import { db } from "@/lib/db"; import PageHeader from "@/components/PageHeader";
export const metadata = { title: "Locomotive classes" }; export const revalidate = 3600;
export default async function Classes() {
  const { data } = await db.from("loco_classes").select("code,slug,locomotives(count)").order("code");
  return <><PageHeader title="Locomotive classes" crumbs={[{ label: "Classes" }]}><p>Every class in the database with the number of locomotives listed under it.</p></PageHeader>
    <div className="table-wrap max-w-2xl"><table className="data-table"><thead><tr><th scope="col">Class</th><th scope="col" className="num">Listed locomotives</th></tr></thead><tbody>
    {(data ?? []).map((c: any) => <tr key={c.slug}><td><Link href={`/locomotives/${c.slug}`}>{c.code}</Link></td><td className="num">{(c.locomotives?.[0]?.count ?? 0).toLocaleString()}</td></tr>)}</tbody></table></div></>;
}
