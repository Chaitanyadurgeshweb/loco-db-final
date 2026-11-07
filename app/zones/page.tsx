import Link from "next/link"; import { db } from "@/lib/db"; import PageHeader from "@/components/PageHeader";
export const metadata = { title: "Zones" }; export const revalidate = 3600;
export default async function Index() {
  const { data } = await db.from("zones").select("code,name").order("code");
  return <><PageHeader title="Zones" crumbs={[{ label: "Zones" }]}><p>Railway zones as recorded in the database.</p></PageHeader>
    <div className="table-wrap max-w-2xl"><table className="data-table"><thead><tr><th scope="col">Code</th><th scope="col">Zone</th></tr></thead><tbody>
    {(data ?? []).map((r: any) => <tr key={r.code}><td><Link href={`/zones/${r.code}`}>{r.code}</Link></td><td>{r.name}</td></tr>)}</tbody></table></div></>;
}
