// app/api/chapters/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/app/lib/database';

// GET: Fetch chapter content
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Await params before using
    const { id } = await params;
    
    const result = await sql`
      SELECT cr.*, p.user_id 
      FROM content_references cr
      JOIN projects p ON cr.project_id = p.id
      WHERE cr.id = ${id} AND p.user_id = ${session.user.id}
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
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, word_count, title } = body;
    
    // Await params before using
    const { id } = await params;

    // Verify ownership
    const ownership = await sql`
      SELECT cr.id 
      FROM content_references cr
      JOIN projects p ON cr.project_id = p.id
      WHERE cr.id = ${id} AND p.user_id = ${session.user.id}
    `;

    if (ownership.length === 0) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Build update query based on what's provided
    let updateQuery;
    if (title !== undefined && content === undefined) {
      // Only updating title
      updateQuery = sql`
        UPDATE content_references 
        SET 
          title = ${title},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (content !== undefined) {
      // Updating content (and possibly word count)
      updateQuery = sql`
        UPDATE content_references 
        SET 
          content = ${content},
          word_count = ${word_count},
          version_number = version_number + 1,
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      // No valid update fields provided
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await updateQuery;
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}