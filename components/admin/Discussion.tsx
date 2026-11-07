import type { SupabaseClient } from "@supabase/supabase-js"; import CommentBox from "./CommentBox";
const stamp = (v: string) => new Date(v).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";
/** Comments and the history of submitted changes for one locomotive. Submissions only: nothing here reveals review outcomes. */
export default async function Discussion({ sb, number }: { sb: SupabaseClient; number: number }) {
  const [c, a] = await Promise.all([
    sb.from("loco_comments").select("id,author_email,comment,created_at").eq("loco_number", number).order("created_at", { ascending: false }).limit(50),
    sb.from("loco_activity").select("id,summary,created_at").eq("loco_number", number).order("created_at", { ascending: false }).limit(50)]);
  return <section className="mt-10 grid lg:grid-cols-2 gap-8" aria-label="Comments and activity">
    <div><h2 className="!mt-0">Comments</h2><CommentBox number={number} />
      {c.error ? <p role="alert" className="notice notice-error mt-3">Could not load comments.</p> : (c.data ?? []).length === 0 ? <p className="text-sm text-gray-600 mt-3">No comments yet.</p> :
        <ul className="mt-4 space-y-3">{(c.data ?? []).map((x: any) => <li key={x.id} className="border border-gray-200 rounded p-3 text-sm"><p className="whitespace-pre-wrap break-words">{x.comment}</p>
          <p className="text-xs text-gray-600 mt-1">{x.author_email} · {stamp(x.created_at)}</p></li>)}</ul>}</div>
    <div><h2 className="!mt-0">Activity history</h2>
      {a.error ? <p role="alert" className="notice notice-error">Could not load the activity history.</p> : (a.data ?? []).length === 0 ? <p className="text-sm text-gray-600">No submissions yet for this locomotive.</p> :
        <ol className="space-y-3">{(a.data ?? []).map((x: any) => <li key={x.id} className="border-l-4 border-navy pl-3 text-sm"><p className="break-words">{x.summary}</p><p className="text-xs text-gray-600 mt-1">{stamp(x.created_at)}</p></li>)}</ol>}</div></section>;
}
