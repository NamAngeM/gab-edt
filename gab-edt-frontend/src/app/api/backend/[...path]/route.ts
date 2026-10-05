import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
  clearAuthCookies,
  refreshTokens,
  setAuthCookies,
  type BackendTokens,
} from '@/lib/server/auth';

/**
 * Proxy authentifié vers l'API Spring : /api/backend/rooms → {BACKEND_URL}/rooms.
 * Lit le jeton dans le cookie HttpOnly, l'ajoute en en-tête Authorization et, si le jeton
 * d'accès a expiré, le renouvelle une fois avec le refresh token avant de rejouer la requête.
 */

type Context = { params: Promise<{ path: string[] }> };

// En-têtes transmis tels quels à l'API (pas de cookies ni d'Authorization venant du navigateur)
const FORWARDED_REQUEST_HEADERS = ['content-type', 'accept', 'accept-language'];
const FORWARDED_RESPONSE_HEADERS = ['content-type', 'content-disposition', 'x-total-count'];

async function forward(request: NextRequest, path: string[], body: ArrayBuffer | undefined, token: string | undefined) {
  const url = `${BACKEND_URL}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { method: request.method, headers, body, cache: 'no-store', redirect: 'manual' });
}

async function handle(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

  let refreshed: BackendTokens | null = null;
  let backendResponse: Response;
  try {
    backendResponse = await forward(request, path, body, request.cookies.get(ACCESS_COOKIE)?.value);
    if (backendResponse.status === 401) {
      refreshed = await refreshTokens(request.cookies.get(REFRESH_COOKIE)?.value);
      if (refreshed) {
        backendResponse = await forward(request, path, body, refreshed.token);
      }
    }
  } catch (error) {
    console.error('API injoignable:', error);
    return NextResponse.json({ message: 'Service indisponible. Réessayez plus tard.' }, { status: 503 });
  }

  const headers = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = backendResponse.headers.get(name);
    if (value) headers.set(name, value);
  }
  const response = new NextResponse(backendResponse.body, { status: backendResponse.status, headers });

  if (refreshed) {
    setAuthCookies(response, refreshed);
  } else if (backendResponse.status === 401) {
    clearAuthCookies(response);
  }
  return response;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
