import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";

/**
 * Optimistic auth check for the admin area: visitors without a valid session
 * token are sent to the login page. Every admin page and server action also
 * verifies the session against the database (see lib/auth/dal.ts).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/admin/login/") return NextResponse.next();
  // Server actions check the session themselves; a redirect here would break the action's
  // response (the editors' save actions answer with a "you have been logged out" message instead).
  if (request.headers.has("next-action")) return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/admin/login/", request.url);
    if (pathname !== "/admin" && pathname !== "/admin/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
