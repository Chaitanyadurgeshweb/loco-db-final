"use client";
import { useState } from "react"; import { useFormState } from "react-dom";
import type { FormState } from "@/lib/loco-schema"; import SubmitButton from "@/components/admin/SubmitButton";
export default function AuthForm({ action, variant, next }: { action: (s: FormState, f: FormData) => Promise<FormState>; variant: "admin" | "master"; next?: string }) {
  const [s, formAction] = useFormState<FormState, FormData>(action, { status: "idle" });
  const [show, setShow] = useState(false);
  const fe = s.fieldErrors ?? {}, master = variant === "master";
  return <form action={formAction} noValidate className="space-y-4 w-full max-w-sm">
    <div><h1 className="!text-2xl !mb-1">{master ? "Master Admin sign-in" : "Administrator sign-in"}</h1>
      <p className="text-sm text-gray-600">{master ? "Sign in with your Master Administrator account." : "Sign in with your administrator account. There is no public registration."}</p></div>
    {next && <input type="hidden" name="next" value={next} />}
    {s.message && <p role="alert" className="notice notice-error">{s.message}</p>}
    <div><label htmlFor="email" className="label">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required defaultValue={s.values?.email} className="input !py-2.5" aria-invalid={!!fe.email} aria-describedby={fe.email ? "email-err" : undefined} />
      {fe.email && <p id="email-err" className="field-error">{fe.email}</p>}</div>
    <div><label htmlFor="password" className="label">Password</label>
      <div className="relative"><input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="input !py-2.5 pr-16" aria-invalid={!!fe.password} aria-describedby={fe.password ? "pw-err" : undefined} />
        <button type="button" onClick={() => setShow(v => !v)} aria-pressed={show} aria-controls="password" className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-gray-700 hover:text-black">{show ? "Hide" : "Show"}</button></div>
      {fe.password && <p id="pw-err" className="field-error">{fe.password}</p>}</div>
    <SubmitButton pending="Signing in…" className={`w-full !py-2.5 ${master ? "!bg-rail !border-rail hover:!bg-red-900" : ""}`}>Sign in</SubmitButton>
    <p className="text-xs text-gray-500">{master ? "Not a Master Administrator? Use the administrator sign-in instead." : "Master Administrator? Use the Master sign-in."}{" "}
      <a href={master ? "/admin/login" : "/master/login"}>{master ? "Administrator sign-in" : "Master sign-in"}</a></p></form>;
}
