import { NextRequest, NextResponse } from "next/server";

// Routes each role is allowed to access
const ROLE_ROUTES: Record<string, string[]> = {
  customer: ["/customer"],
  provider: ["/provider"],
  admin: ["/admin"],
};

// Public routes that don't require auth
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/help", "/escrow-demo"];

// Admin login is a special unlisted public route
const ADMIN_LOGIN = "/admin/login";

function getRoleFromCookies(req: NextRequest): string | null {
  // We can't decode JWT in Edge middleware without jose library easily,
  // so we rely on a lightweight role cookie set on login.
  return req.cookies.get("hrp_role")?.value ?? null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public routes and admin login
  if (PUBLIC_ROUTES.some((r) => pathname === r) || pathname === ADMIN_LOGIN) {
    return NextResponse.next();
  }

  // Check if the user has an access token or refresh token cookie
  const hasToken =
    req.cookies.has("hrp_access_token") || req.cookies.has("hrp_refresh_token");

  if (!hasToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = getRoleFromCookies(req);

  // If no role cookie, let it through — the client AuthContext will handle
  if (!role) return NextResponse.next();

  // Role-based route guarding
  for (const [allowedRole, prefixes] of Object.entries(ROLE_ROUTES)) {
    if (prefixes.some((p) => pathname.startsWith(p)) && role !== allowedRole) {
      // Redirect to their own dashboard
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
