"use client";
import { useFormStatus } from "react-dom";
export default function SubmitButton({ children, pending: label = "Working…", className = "", disabled = false }: { children: React.ReactNode; pending?: string; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending || disabled} aria-disabled={pending || disabled} aria-busy={pending} className={`btn btn-primary ${className}`}>
    {pending && <span aria-hidden="true" className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}{pending ? label : children}</button>;
}
