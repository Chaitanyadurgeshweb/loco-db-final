"use client";
import { useFormState } from "react-dom"; import type { FormState } from "@/lib/loco-schema"; import { addComment } from "@/app/admin/(protected)/locos/comment-actions"; import SubmitButton from "./SubmitButton";
export default function CommentBox({ number }: { number: number }) {
  const [s, action] = useFormState<FormState, FormData>(addComment, { status: "idle" });
  return <form action={action} className="space-y-2 max-w-2xl" key={s.status === "success" ? Date.now() : "f"}>
    <input type="hidden" name="number" value={number} />
    <label htmlFor="comment" className="label">Add a comment</label>
    <textarea id="comment" name="comment" rows={3} maxLength={2000} required defaultValue={s.status === "error" ? s.values?.comment : ""} className="input" placeholder="Notes about this locomotive record" />
    {s.message && <p role={s.status === "error" ? "alert" : "status"} className={`notice ${s.status === "error" ? "notice-error" : "notice-ok"}`}>{s.message}</p>}
    <SubmitButton pending="Adding…">Add comment</SubmitButton></form>;
}
