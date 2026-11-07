import Breadcrumbs, { Crumb } from "./Breadcrumbs";
export default function PageHeader({ title, crumbs = [], children }: { title: string; crumbs?: Crumb[]; children?: React.ReactNode }) {
  return <div className="mb-6 pb-4 border-b border-gray-200"><Breadcrumbs items={crumbs.length ? crumbs : [{ label: title }]} />
    <h1>{title}</h1>{children && <div className="text-gray-700 max-w-3xl">{children}</div>}</div>;
}
