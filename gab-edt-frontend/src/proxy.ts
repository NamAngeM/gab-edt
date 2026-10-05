import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ROLE_HOME,
  allowedRolesFor,
  clearAuthCookies,
  refreshTokens,
  setAuthCookies,
  verifyAccessToken,
  type BackendTokens,
} from '@/lib/server/auth';
import { SHOW_PREVIEW_FEATURES, isPreviewRoute } from '@/lib/features';

/**
 * Garde des espaces web : vérifie le jeton (signature + expiration) et le rôle.
 * Un rôle qui n'a pas accès à un espace est renvoyé vers le sien ; un jeton d'accès
 * expiré est renouvelé de façon transparente avec le refresh token.
 */
export async function proxy(request: NextRequest) {
  const allowedRoles = allowedRolesFor(request.nextUrl.pathname);
  if (!allowedRoles) {
    return NextResponse.next();
  }

  let refreshed: BackendTokens | null = null;
  let claims = await verifyAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);
  if (!claims) {
    refreshed = await refreshTokens(request.cookies.get(REFRESH_COOKIE)?.value);
    claims = refreshed ? await verifyAccessToken(refreshed.token) : null;
  }

  if (!claims) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  }

  const role = claims.role ?? '';
  const blockedPreview = !SHOW_PREVIEW_FEATURES && isPreviewRoute(request.nextUrl.pathname);
  const response = allowedRoles.includes(role) && !blockedPreview
    ? NextResponse.next()
    : NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/login', request.url));

  if (refreshed) {
    setAuthCookies(response, refreshed);
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/teacher/:path*', '/super-admin/:path*', '/tv/:path*'],
};
