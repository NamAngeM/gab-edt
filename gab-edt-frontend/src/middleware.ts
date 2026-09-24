import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Utiliser une variable d'environnement partagée ou le secret de dev fallback
const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKeyThatShouldBeAtLeast32BytesLongAndSecureForDevOnly';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('jwt_token')?.value;

    const isProtected = request.nextUrl.pathname.startsWith('/admin') ||
                        request.nextUrl.pathname.startsWith('/student') ||
                        request.nextUrl.pathname.startsWith('/teacher');

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            await jwtVerify(token, secret);
        } catch (error) {
            console.error('Invalid token in middleware:', error);
            // Si le token est invalide ou expiré, on redirige vers le login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('jwt_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/student/:path*', '/teacher/:path*'],
};
