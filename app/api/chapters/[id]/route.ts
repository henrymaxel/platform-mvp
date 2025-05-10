//app/api/chapters/[id]/route.ts
import { NextResponse } from 'next/server';
import getServerSession from 'next-auth';
import { authConfig } from '@/auth.config';
import { sql } from '@/app/lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // First, check if user owns the project this chapter belongs to
    console.log("PARAM ID: ", params.id);
    const [chapter] = await sql`
      SELECT cr.*, p.user_id 
      FROM content_references cr
      JOIN projects p ON cr.project_id = p.id
      WHERE cr.id = ${params.id} AND p.user_id = ${session.user.id}
    `;

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      ...chapter,
      content: chapter.content || ''
    });
  } catch (error) {
    console.error('Failed to fetch chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, word_count } = await request.json();

    // Check ownership
    const [ownershipCheck] = await sql`
      SELECT cr.id 
      FROM content_references cr
      JOIN projects p ON cr.project_id = p.id
      WHERE cr.id = ${params.id} AND p.user_id = ${session.user.id}
    `;

    if (!ownershipCheck) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Update chapter content and word count using transaction
    await sql.begin(async sql => {
      // Update chapter
      await sql`
        UPDATE content_references 
        SET content = ${content}, 
            word_count = ${word_count},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${params.id}
      `;

      // Create a draft backup
      await sql`
        INSERT INTO draft_backups (project_id, content_snapshot)
        SELECT project_id, ${JSON.stringify({ content, word_count, timestamp: new Date().toISOString() })}
        FROM content_references 
        WHERE id = ${params.id}
      `;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update chapter:', error);
    return NextResponse.json(
      { error: 'Failed to update chapter' },
      { status: 500 }
    );
  }
}