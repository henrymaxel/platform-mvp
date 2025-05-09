import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

// This route is only for development testing
export async function GET(request: Request) {
    // Only work in development
    if (process.env.MODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }
    
    // Create a mock session for test user
    const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
    };
    
    // Create a JWT session token
    const token = sign(
        { user },
        process.env.NEXTAUTH_SECRET || 'development-secret',
        { expiresIn: '1d' }
    );
    
    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('next-auth.session-token', token, {
        httpOnly: true,
        secure: false, // Set to false for development
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    });
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
}