import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

export async function middleware(request) {
    const authMiddleware = await NextAuth(authConfig).auth(request);

    if (authMiddleware instanceof Response && authMiddleware.status !== 200) {
        return authMiddleware;
    }

    const response = NextResponse.next();

    response.headers.set(
        'Content-Security-Policy',
         "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    );

    return response;
}

export const config = {
    matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)',
    '/api/:path*'
    ],
}