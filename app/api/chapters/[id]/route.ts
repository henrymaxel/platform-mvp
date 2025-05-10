// app/api/chapters/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';  // This is what you should use instead of getServerSession
import { sql } from '@/app/lib/database';

// GET: Fetch chapter content
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();  // Use auth() instead of getServerSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sql`
      SELECT cr.*, p.user_id 
      FROM content_references cr
      JOIN projects p ON cr.project_id = p.id
      WHERE cr.id = ${params.id} AND p.user_id = ${session.user.id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}

// PUT: Update chapter content
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();  // Use auth() instead of getServerSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, word_count } = await req.json();

    // Verify ownership
    const ownership = await sql`
      SELECT cr.id 
      FROM content_references cr
      JOIN projects p ON cr.project_id = p.id
      WHERE cr.id = ${params.id} AND p.user_id = ${session.user.id}
    `;

    if (ownership.length === 0) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Update chapter content
    const result = await sql`
      UPDATE content_references 
      SET 
        content = ${content},
        word_count = ${word_count},
        version_number = version_number + 1,
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}