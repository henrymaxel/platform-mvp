//app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Import from your auth.ts file
import { sql } from '@/app/lib/database';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log(session?.user?.id);
  try {
    // Get user's projects
    const projects = await sql 
    `SELECT 
        p.id, 
        p.title, 
        p.description,
        p.word_count_goal,
        p.current_word_count,
        p.status,
        p.visibility
      FROM projects p
      WHERE p.user_id = ${session.user.id}
      ORDER BY p.updated_at DESC;`;

    // Ensure projects is an array
    const projectsArray = Array.isArray(projects) ? projects : [];

    // Get chapters for each project
    const projectsWithChapters = await Promise.all(
      projectsArray.map(async (project) => {
        const chapters = await sql`
          SELECT 
            cr.id,
            cr.title,
            cr.chapter_number,
            cr.storage_path,
            cr.version_number,
            COALESCE(cr.content, '') as content,
            COALESCE(cr.word_count, 0) as words,
            CASE 
              WHEN cr.word_count > 0 THEN 'completed'
              WHEN cr.content IS NOT NULL THEN 'in-progress'
              ELSE 'outline'
            END as status
          FROM content_references cr
          WHERE cr.project_id = ${project.id}
          ORDER BY cr.chapter_number
        `;

        console.log("CHAPTERS: ", chapters);
        return {
          ...project,
          chapters: Array.isArray(chapters) ? chapters : []
        };
      })
    );

    return NextResponse.json(projectsWithChapters);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, word_count_goal } = await request.json();

    const [newProject] = await sql`
      INSERT INTO projects (user_id, title, description, word_count_goal, status, visibility)
      VALUES (${session.user.id}, ${title}, ${description}, ${word_count_goal}, 'active', 'private')
      RETURNING id
    `;

    return NextResponse.json({ id: newProject.id });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}