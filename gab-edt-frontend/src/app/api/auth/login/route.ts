import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const token = data.data?.token || data.token;
    
    if (!token) {
      return NextResponse.json({ message: 'Token manquant de la réponse backend' }, { status: 500 });
    }

    // On prépare la réponse
    const nextResponse = NextResponse.json(data, { status: 200 });

    // On configure le cookie HttpOnly, Secure, SameSite=Lax (ou Strict)
    nextResponse.cookies.set('jwt_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Lax permet la navigation, Strict est mieux mais parfois bloquant
      maxAge: 86400, // 24h
      path: '/',
    });

    return nextResponse;

  } catch (error) {
    console.error('Erreur API login:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
