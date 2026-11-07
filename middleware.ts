import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Defence in depth only: refreshes the session and sends signed-out visitors to the matching login page.
// The real authorisation checks are in lib/auth.ts (pages and server actions) and in database RLS.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(list) {
      list.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      list.forEach(({ name, value, options }) => response.cookies.set(name, value,
        { ...options, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" }));
    } } });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname, master = path.startsWith("/master");
  const loginPath = master ? "/master/login" : "/admin/login";
  if (!user && path !== loginPath) {
    const to = request.nextUrl.clone(); const back = path + request.nextUrl.search; to.pathname = loginPath; to.search = "";
    if (master && path !== "/master") to.searchParams.set("next", back);       // lets an emailed link return here after sign-in
    return NextResponse.redirect(to);
  }
  return response;
}
export const config = { matcher: ["/admin/:path*", "/master/:path*"] };
