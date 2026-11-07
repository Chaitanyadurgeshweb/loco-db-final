import { searchLocos, Filters } from "@/lib/db"; import LocoTable from "./LocoTable"; import Pager from "./Pager";
export default async function ListedLocos({ base, filters }: { base: string; filters: Filters }) {
  const { rows, total, page } = await searchLocos(filters);
  const { page: _p, ...rest } = filters;
  return <><Pager base={base} params={rest as Record<string,string|undefined>} page={page} total={total} /><LocoTable rows={rows} /></>;
}
