"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <div role="alert" className="notice notice-error"><h1 className="!text-red-900">Something went wrong</h1>
    <p>The data could not be loaded just now. This is usually temporary.</p><button onClick={reset} className="btn mt-3">Try again</button></div>;
}
