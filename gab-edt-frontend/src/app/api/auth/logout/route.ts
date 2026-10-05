import { NextResponse, type NextRequest } from 'next/server';
import { BACKEND_URL, REFRESH_COOKIE, clearAuthCookies } from '@/lib/server/auth';

/** Déconnexion : révoque le refresh token côté API puis efface les cookies. */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      });
    } catch {
      // L'API est injoignable : on efface quand même la session côté navigateur
    }
  }
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
