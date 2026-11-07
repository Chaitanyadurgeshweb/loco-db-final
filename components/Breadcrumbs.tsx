import Link from "next/link";
export type Crumb = { label: string; href?: string };
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return <nav aria-label="Breadcrumb" className="text-sm text-gray-700 mb-3"><ol className="flex flex-wrap items-center gap-x-2">
    <li><Link href="/">Home</Link></li>
    {items.map((c, i) => <li key={i} className="flex items-center gap-x-2"><span aria-hidden="true">/</span>
      {c.href && i < items.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page" className="text-gray-900">{c.label}</span>}</li>)}
  </ol></nav>;
}
