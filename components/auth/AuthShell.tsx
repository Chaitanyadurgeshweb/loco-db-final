/** Shared sign-in layout. The Master Admin variant is deliberately different (dark panel, red accent, badge) so the two entrances cannot be confused. */
export default function AuthShell({ variant, children }: { variant: "admin" | "master"; children: React.ReactNode }) {
  const master = variant === "master";
  return <div className="grid md:grid-cols-2 min-h-[32rem] border border-gray-200 rounded-lg overflow-hidden shadow-sm my-4">
    <aside className={`relative hidden md:flex flex-col justify-between p-8 text-white ${master ? "bg-gray-900" : "bg-navy"}`}>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg, #fff 0 6px, transparent 6px 28px)", maskImage: "linear-gradient(transparent, #000)" }} />
      <div><span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${master ? "bg-rail" : "bg-white/15"}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /></svg>{master ? "Master Administrator" : "Administrator"}</span>
        <h2 className="!text-white !border-0 !mt-6 !text-2xl">{master ? "Approval console" : "Loco Portal administration"}</h2>
        <p className="text-gray-300 text-sm mt-2 max-w-xs">{master ? "Review, approve or decline submitted locomotive data. Every decision is recorded in the audit history." : "Submit new locomotives, request changes and upload data in bulk. Submissions are reviewed before they go live."}</p></div>
      <p className="relative text-xs text-gray-400">Authorised personnel only. Activity is logged.</p></aside>
    <main id="main" className="p-6 sm:p-10 flex flex-col justify-center bg-white">
      <div className={`md:hidden mb-5 h-1.5 w-16 rounded ${master ? "bg-rail" : "bg-navy"}`} aria-hidden="true" />
      <p className={`md:hidden text-xs font-semibold uppercase tracking-wider mb-1 ${master ? "text-rail" : "text-navy"}`}>{master ? "Master Administrator" : "Administrator"}</p>
      {children}</main></div>;
}
