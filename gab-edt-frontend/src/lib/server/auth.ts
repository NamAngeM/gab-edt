import { jwtVerify, type JWTPayload } from 'jose';
import type { NextResponse } from 'next/server';

/**
 * Authentification côté serveur Next.js (pattern « Backend for Frontend »).
 *
 * Les jetons émis par l'API ne sont jamais exposés au JavaScript du navigateur :
 * ils vivent dans des cookies HttpOnly posés par Next.js, et toutes les requêtes
 * vers l'API passent par la route /api/backend/* qui ajoute l'en-tête Authorization.
 */

export const ACCESS_COOKIE = 'jwt_token';
export const REFRESH_COOKIE = 'refresh_token';

/** URL de l'API Spring, côté serveur uniquement (jamais exposée au navigateur). */
export const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const ACCESS_MAX_AGE = Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION || 900000) / 1000;
const REFRESH_MAX_AGE = Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION || 604800000) / 1000;

const DEV_SECRET = 'defaultSecretKeyThatShouldBeAtLeast32BytesLongAndSecureForDevOnly';

function jwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? DEV_SECRET : '');
  // En production sans secret, on refuse tout (fail-closed) plutôt que d'accepter un secret par défaut
  return secret ? new TextEncoder().encode(secret) : null;
}

export interface SessionClaims extends JWTPayload {
  role?: string;
  userId?: string;
  tenantId?: string;
  type?: string;
}

/** Vérifie la signature et l'expiration du jeton d'accès. */
export async function verifyAccessToken(token: string | undefined): Promise<SessionClaims | null> {
  const secret = jwtSecret();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify<SessionClaims>(token, secret);
    return payload.type === 'ACCESS' ? payload : null;
  } catch {
    return null;
  }
}

export interface BackendTokens {
  token: string;
  refreshToken: string;
}

/** Échange un refresh token contre une nouvelle paire de jetons (rotation côté API). */
export async function refreshTokens(refreshToken: string | undefined): Promise<BackendTokens | null> {
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = await res.json();
    const data = body?.data;
    return data?.token && data?.refreshToken ? { token: data.token, refreshToken: data.refreshToken } : null;
  } catch {
    return null;
  }
}

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(response: NextResponse, tokens: BackendTokens) {
  response.cookies.set(ACCESS_COOKIE, tokens.token, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, '', { ...baseCookie, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, '', { ...baseCookie, maxAge: 0 });
}

/** Espace web autorisé pour chaque rôle. */
export const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: '/super-admin',
  SCHOOL_ADMIN: '/admin',
  PEDAGOGICAL_MANAGER: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/student',
};

const AREA_ROLES: Record<string, string[]> = {
  '/super-admin': ['SUPER_ADMIN'],
  '/admin': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER'],
  '/teacher': ['TEACHER'],
  '/student': ['STUDENT', 'PARENT'],
  '/tv': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER'],
};

/** Rôles autorisés pour un chemin, ou null si le chemin n'est pas protégé. */
export function allowedRolesFor(pathname: string): string[] | null {
  const area = Object.keys(AREA_ROLES).find((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
  return area ? AREA_ROLES[area] : null;
}
