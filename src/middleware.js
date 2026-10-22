import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/otp-verification",
  "/set-new-password",
];

// Where each role lands after login / when it hits a page it isn't allowed to see.
const ROLE_HOME = {
  admin: "/admin/dashboard",
  agent: "/admin/order-details",
  vendor: "/admin/vendor/vendor-dashboard-overview",
};

// Path prefixes that belong exclusively to one role's own area of the app.
// Anything under these prefixes requires that exact role.
const ROLE_EXCLUSIVE_PREFIXES = {
  vendor: "/admin/vendor",
  agent: "/admin/agent",
};

// A handful of pages under /admin/* are shared by every logged-in role
// (header notification bell / profile menu, and the agent's one page that
// lives outside /admin/agent).
const SHARED_ROUTES = ["/admin/profile", "/admin/notification", "/admin/order-details"];

/**
 * Decode the auth cookie to find the user's role. Returns null for a
 * missing, malformed, or expired token so callers can treat it the same
 * as "not logged in" — middleware only ever reads the token for routing
 * decisions, the API is still the source of truth for authorization.
 */
function getRoleFromToken(token) {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    if (decoded?.exp && Date.now() >= decoded.exp * 1000) return null;
    return decoded?.role || null;
  } catch {
    return null;
  }
}

export function middleware(request) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const token = request.cookies.get("hoodz_Dahboard_token")?.value;
  const role = getRoleFromToken(token);
  const isLoggedIn = Boolean(role);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Root path always sends a logged-in user straight to their own home,
  // instead of relying on the generic "/" -> "/admin/dashboard" redirect
  // in next.config.mjs (which would otherwise briefly point non-admins at
  // an admin-only page before this middleware corrects it).
  if (isLoggedIn && pathname === "/") {
    return NextResponse.redirect(
      new URL(ROLE_HOME[role] || "/admin/dashboard", request.url),
    );
  }

  // Logged in users shouldn't see the login/forgot-password screens again.
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(
      new URL(ROLE_HOME[role] || "/admin/dashboard", request.url),
    );
  }

  // Not logged in (or token expired/invalid) → send to login and drop the
  // stale cookie so it doesn't keep failing silently on every request.
  if (!isLoggedIn && !isAuthRoute) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) response.cookies.delete("hoodz_Dahboard_token");
    return response;
  }

  // --- Role-based access control -----------------------------------------
  // Defense in depth: even though the API should also reject cross-role
  // requests, the dashboard itself shouldn't render an admin/agent page for
  // a vendor (or vice versa) just because they typed the URL. Without this,
  // any logged-in user could browse straight to another role's routes.
  if (isLoggedIn && pathname.startsWith("/admin")) {
    if (!SHARED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      const exclusivePrefix = Object.entries(ROLE_EXCLUSIVE_PREFIXES).find(
        ([, prefix]) => pathname.startsWith(prefix),
      );

      if (exclusivePrefix) {
        const [ownerRole] = exclusivePrefix;
        if (role !== ownerRole) {
          return NextResponse.redirect(
            new URL(ROLE_HOME[role] || "/login", request.url),
          );
        }
      } else if (role !== "admin") {
        // Anything else under /admin/* that isn't vendor-/agent-exclusive
        // or explicitly shared is treated as admin-only.
        return NextResponse.redirect(
          new URL(ROLE_HOME[role] || "/login", request.url),
        );
      }
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // exclude firebase service worker and static assets
    "/((?!api|_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|nouser.png).*)",
    "/admin/:path*",
  ],
};
