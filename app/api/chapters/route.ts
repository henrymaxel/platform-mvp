// app/api/chapters/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/app/lib/database';

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { project_id, title, chapter_number } = await req.json();

    // Verify project ownership
    const projectOwnership = await sql`
      SELECT id FROM projects 
      WHERE id = ${project_id} AND user_id = ${session.user.id}
    `;

    if (projectOwnership.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create new chapter
    const result = await sql`
      INSERT INTO content_references (
        project_id,
        title,
        chapter_number,
        storage_path,
        content,
        word_count,
        version_number
      ) VALUES (
        ${project_id},
        ${title},
        ${chapter_number},
        ${`/storage/chapters/chapter_${chapter_number}.md`},
        '',
        0,
        1
      )
      RETURNING 
        id,
        title,
        chapter_number,
        storage_path,
        version_number,
        COALESCE(content, '') as content,
        COALESCE(word_count, 0) as words,
        CASE 
          WHEN word_count > 0 THEN 'completed'
          WHEN content IS NOT NULL THEN 'in-progress'
          ELSE 'outline'
        END as status
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to create chapter:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter', details: error },
      { status: 500 }
    );
  }
}