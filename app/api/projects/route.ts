import { NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import { sql } from '@/app/lib/database';

// IMPORTANT: These must be named exports with async functions
// In app/api/projects/route.ts
export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get user's projects
    const projectsResult = await sql`
      SELECT 
        p.id, 
        p.title, 
        p.description,
        p.word_count_goal,
        p.current_word_count,
        p.status,
        p.visibility
      FROM projects p
      WHERE p.user_id = ${session.user.id}
      ORDER BY p.updated_at DESC;
    `;

    // Extract projects from result
    const projects = projectsResult.rows || projectsResult;
    console.log("Projects array:", projects);

    // Get chapters for each project
    const projectsWithChapters = await Promise.all(
      projects.map(async (project) => {
        const chaptersResult = await sql`
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

        // Extract chapters from result
        const chapters = chaptersResult.rows || chaptersResult;
        console.log(`Chapters for project ${project.id}:`, chapters);

        return {
          ...project,
          chapters: chapters
        };
      })
    );

    console.log("Final projects with chapters:", JSON.stringify(projectsWithChapters, null, 2));

    return NextResponse.json(projectsWithChapters);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, word_count_goal } = await request.json();

    const result = await sql`
      INSERT INTO projects (user_id, title, description, word_count_goal, status, visibility)
      VALUES (${session.user.id}, ${title}, ${description}, ${word_count_goal}, 'active', 'private')
      RETURNING id
    `;

    const newProject = result[0];

    return NextResponse.json({ id: newProject.id });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}