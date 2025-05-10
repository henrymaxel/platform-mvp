//app/api/test-projects/route.ts
import { NextResponse } from 'next/server';
import getServerSession from 'next-auth';
import { authOptions } from '@/auth.config';
import { sql } from '@/app/lib/database';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Test query to debug what's being returned
    const result = await sql`
      SELECT 
        p.id, 
        p.title
      FROM projects p
      WHERE p.user_id = ${session.user.id}
      LIMIT 5
    `;

    console.log('Raw SQL result:', result);
    console.log('Is array?', Array.isArray(result));
    console.log('Type:', typeof result);

    return NextResponse.json({
      debug: {
        isArray: Array.isArray(result),
        type: typeof result,
        length: result.length,
        firstItem: result[0],
      },
      data: result
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}