// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import { sql } from '@/app/lib/database';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get user's subscription info
    const userInfo = await sql`
      SELECT 
        u.subscription_tier_id,
        st.name as tier_name,
        st.max_project_count
      FROM users u
      LEFT JOIN subscription_tiers st ON u.subscription_tier_id = st.id
      WHERE u.id = ${session.user.id}
    `;

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
    const projects = projectsResult.rows ?? projectsResult;

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
        const chapters = chaptersResult.rows ?? chaptersResult;

        return {
          ...project,
          chapters: chapters
        };
      })
    );

    // Provide default tier if user has no subscription
    const tierName = userInfo[0]?.tier_name || 'Free';
    const maxProjectCount = userInfo[0]?.max_project_count ?? 3; // Default to 3 for free tier
    
    return NextResponse.json({
      projects: projectsWithChapters,
      subscription: {
        tier_name: tierName,
        max_project_count: maxProjectCount,
        current_project_count: projects.length
      }
    });
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

    // Check user's subscription tier and current project count
    const userInfo = await sql`
      SELECT 
        u.subscription_tier_id,
        st.max_project_count,
        (SELECT COUNT(*) FROM projects WHERE user_id = u.id) as current_project_count
      FROM users u
      LEFT JOIN subscription_tiers st ON u.subscription_tier_id = st.id
      WHERE u.id = ${session.user.id}
    `;

    const maxProjects = userInfo[0]?.max_project_count ?? 3; // Default to 3 for free tier
    const currentProjects = userInfo[0]?.current_project_count || 0;

    if (currentProjects >= maxProjects) {
      return NextResponse.json(
        { 
          error: 'Project limit reached',
          message: `You have reached the maximum number of projects (${maxProjects}) for your subscription tier. Please upgrade to create more projects.`,
          current_count: currentProjects,
          max_count: maxProjects
        },
        { status: 403 }
      );
    }

    const { title, description, word_count_goal } = await request.json();

    // Validate input
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO projects (user_id, title, description, word_count_goal, status, visibility)
      VALUES (${session.user.id}, ${title}, ${description}, ${word_count_goal || 50000}, 'active', 'private')
      RETURNING id
    `;

    const newProject = result[0];

    return NextResponse.json({ id: newProject.id });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create project',
        message: error instanceof Error ? error : 'Unknown error'
      },
      { status: 500 }
    );
  }
}