import Link from "next/link"; import { db } from "@/lib/db"; import PageHeader from "@/components/PageHeader";
export const metadata = { title: "Manufacturers" }; export const revalidate = 3600;
export default async function Index() {
  const { data } = await db.from("manufacturers").select("code,name").order("code");
  return <><PageHeader title="Manufacturers" crumbs={[{ label: "Manufacturers" }]}><p>Production units and builders recorded in the database. Full names are shown only where recorded.</p></PageHeader>
    <div className="table-wrap max-w-2xl"><table className="data-table"><thead><tr><th scope="col">Production unit</th><th scope="col">Name</th></tr></thead><tbody>
    {(data ?? []).map((r: any) => <tr key={r.code}><td><Link href={`/manufacturers/${r.code}`}>{r.code}</Link></td><td>{r.name ?? "—"}</td></tr>)}</tbody></table></div></>;
}
