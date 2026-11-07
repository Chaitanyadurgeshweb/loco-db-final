import Link from "next/link"; import { LocoRow } from "@/lib/db";
export default function LocoTable({ rows }: { rows: LocoRow[] }) {
  if (!rows.length) return <p className="notice">No locomotives match these filters. Try removing a filter or checking the number.</p>;
  return <div className="table-wrap"><table className="data-table"><caption className="sr-only">Locomotives</caption>
    <thead><tr><th scope="col" className="num">Number</th><th scope="col">Class</th><th scope="col">Shed</th><th scope="col">Zone</th><th scope="col">Builder</th><th scope="col">Kavach</th></tr></thead><tbody>
    {rows.map(r => <tr key={r.number}><td className="num"><Link href={`/locos/${r.number}`}>{r.number}</Link></td>
      <td><Link href={`/locomotives/${r.loco_classes.slug}`}>{r.loco_classes.code}</Link></td>
      <td><Link href={`/sheds/${r.sheds.code}`}>{r.sheds.code}</Link> <span className="text-gray-600">{r.sheds.name}</span></td>
      <td><Link href={`/zones/${r.zones.code}`}>{r.zones.code}</Link></td>
      <td>{r.manufacturers?.code ?? "—"}</td><td>{r.kavach_make ?? "—"}</td></tr>)}</tbody></table></div>;
}
