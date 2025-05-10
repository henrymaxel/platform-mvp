//app/api/test-auth/route.ts
import { NextResponse } from 'next/server';
import getServerSession from 'next-auth';
import { authOptions } from '@/auth.config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      sessionData: session || null,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Error getting session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}