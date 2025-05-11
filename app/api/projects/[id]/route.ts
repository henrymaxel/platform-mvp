// app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/app/lib/database';

export async function DELETE(
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
    
    // First verify the project belongs to the user
    const ownership = await sql`
      SELECT id FROM projects 
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    if (ownership.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Start a transaction to delete all related data
    await sql.begin(async sql => {
      // Delete all comments from chapters
      await sql`
        DELETE FROM comments
        WHERE content_reference_id IN (
          SELECT id FROM content_references WHERE project_id = ${id}
        )
      `;

      // Delete all reactions from chapters
      await sql`
        DELETE FROM reactions
        WHERE content_reference_id IN (
          SELECT id FROM content_references WHERE project_id = ${id}
        )
      `;

      // Delete all feedback
      await sql`
        DELETE FROM feedback WHERE project_id = ${id}
      `;

      // Delete all draft backups
      await sql`
        DELETE FROM draft_backups WHERE project_id = ${id}
      `;

      // Delete all AI usage logs
      await sql`
        DELETE FROM ai_usage_logs WHERE project_id = ${id}
      `;

      // Delete all content references (chapters)
      await sql`
        DELETE FROM content_references WHERE project_id = ${id}
      `;

      // Delete all project collaborators
      await sql`
        DELETE FROM project_collaborators WHERE project_id = ${id}
      `;

      // Delete all project assets
      await sql`
        DELETE FROM project_assets WHERE project_id = ${id}
      `;

      // Finally, delete the project itself
      await sql`
        DELETE FROM projects WHERE id = ${id}
      `;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}