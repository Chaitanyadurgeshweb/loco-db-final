import Link from "next/link"; import PageHeader from "@/components/PageHeader";
export default function NotFound() { return <><PageHeader title="Page not found"><p>No record exists at this address. Try the <Link href="/search">search page</Link> or the <Link href="/locomotives">class list</Link>.</p></PageHeader></>; }
