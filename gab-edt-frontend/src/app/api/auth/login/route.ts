import { NextResponse } from 'next/server';
import { BACKEND_URL, setAuthCookies } from '@/lib/server/auth';

/**
 * Connexion : relaie les identifiants à l'API, pose les jetons en cookies HttpOnly
 * et ne renvoie au navigateur que le profil (jamais les jetons).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body?.email, password: body?.password }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || 'Identifiants incorrects.' },
        { status: response.status },
      );
    }

    const auth = data?.data;
    if (!auth?.token || !auth?.refreshToken) {
      return NextResponse.json({ message: 'Réponse inattendue du serveur.' }, { status: 502 });
    }

    const nextResponse = NextResponse.json({
      data: {
        email: auth.email,
        firstName: auth.firstName,
        lastName: auth.lastName,
        role: auth.role,
        institutionId: auth.institutionId,
      },
    });
    setAuthCookies(nextResponse, { token: auth.token, refreshToken: auth.refreshToken });
    return nextResponse;
  } catch (error) {
    console.error('Erreur API login:', error);
    return NextResponse.json({ message: 'Service indisponible. Réessayez plus tard.' }, { status: 503 });
  }
}
