import Link from "next/link"; import PageHeader from "@/components/PageHeader";
export const metadata = { title: "Data status" };
export default function Sources() { return <><PageHeader title="Data status" crumbs={[{ label: "Data status" }]} />
  <ul className="prose-doc list-disc pl-5 space-y-2">
  <li>Locomotive numbers, classes, sheds, zones, production units and Kavach make are compiled from supplied records. Status: <b>source listed, not independently verified</b>.</li>
  <li>Records are normalised for consistency before they are published.</li>
  <li>Specifications, history and photographs are not yet loaded. They will be added only with cited sources.</li>
  <li>This database does not claim to include every Indian Railways locomotive.</li></ul>
  <p className="mt-4 text-sm">See also <Link href="/about">About</Link> and <Link href="/acknowledgements">Acknowledgements</Link>.</p></>; }
