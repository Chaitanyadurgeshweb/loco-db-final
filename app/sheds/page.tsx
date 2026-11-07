import Link from "next/link"; import { db } from "@/lib/db"; import PageHeader from "@/components/PageHeader";
export const metadata = { title: "Sheds" }; export const revalidate = 3600;
export default async function Index() {
  const { data } = await db.from("sheds").select("code,name,location").order("code");
  return <><PageHeader title="Sheds" crumbs={[{ label: "Sheds" }]}><p>Locomotive sheds in the database, with their listed location.</p></PageHeader>
    <div className="table-wrap"><table className="data-table"><thead><tr><th scope="col">Code</th><th scope="col">Shed</th><th scope="col">Location</th></tr></thead><tbody>
    {(data ?? []).map((r: any) => <tr key={r.code}><td><Link href={`/sheds/${r.code}`}>{r.code}</Link></td><td>{r.name}</td><td>{r.location ?? "—"}</td></tr>)}</tbody></table></div></>;
}
