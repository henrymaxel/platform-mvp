import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { rateLimit } from "./app/middleware/rateLimit";

export async function middleware(request) {

    if (request.nextUrl.pathname.startsWith('/api/')) {
        const rateLimitResponse = rateLimit(request);
        if(rateLimitResponse) {
            return rateLimitResponse;
        }
    }
    
    const authMiddleware = await NextAuth(authConfig).auth(request);

    if (authMiddleware instanceof Response && authMiddleware.status !== 200) {
        return authMiddleware;
    }

    const response = NextResponse.next();

    response.headers.set(
        'Content-Security-Policy',
         "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    );

    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return response;
}

export const config = {
    matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)',
    '/api/:path*'
    ],
}