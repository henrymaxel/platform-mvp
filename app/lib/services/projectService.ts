import { sql } from '@/app/lib/database';
import { Project, ProjectsWithSubscription } from '@/app/lib/definitions';
import { measurePerformance } from '@/app/lib/monitoring';

export async function getProjectsByUserId(userId: string): Promise<ProjectsWithSubscription> {

  return await measurePerformance(`getProjectByUserId(${userId})`, async () => {
  // Get user's subscription info
  const userInfo = await sql`
    SELECT 
      u.subscription_tier_id,
      st.name as tier_name,
      st.max_project_count
    FROM users u
    LEFT JOIN subscription_tiers st ON u.subscription_tier_id = st.id
    WHERE u.id = ${userId}
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
    WHERE p.user_id = ${userId}
    ORDER BY p.updated_at DESC;
  `;

  // Get chapters for each project
  const projectsWithChapters = await Promise.all(
    projectsResult.map(async (project) => {
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

      return {
        ...project,
        chapters: chaptersResult
      };
    })
  );

  // Provide default tier if user has no subscription
  const tierName = userInfo[0]?.tier_name || 'Free';
  const maxProjectCount = userInfo[0]?.max_project_count ?? 3;
  
  return {
    projects: projectsWithChapters,
    subscription: {
      tier_name: tierName,
      max_project_count: maxProjectCount,
      current_project_count: projectsResult.length
    }
  };
});
}

export async function createNewProject(
  userId: string, 
  title: string, 
  description: string, 
  wordCountGoal: number = 50000
): Promise<{ id: string }> {
  // Check user's subscription tier and current project count
  const userInfo = await sql`
    SELECT 
      u.subscription_tier_id,
      st.max_project_count,
      (SELECT COUNT(*) FROM projects WHERE user_id = u.id) as current_project_count
    FROM users u
    LEFT JOIN subscription_tiers st ON u.subscription_tier_id = st.id
    WHERE u.id = ${userId}
  `;

  const maxProjects = userInfo[0]?.max_project_count ?? 3;
  const currentProjects = userInfo[0]?.current_project_count || 0;

  if (currentProjects >= maxProjects) {
    throw new Error(`Project limit reached. You can have maximum ${maxProjects} projects.`);
  }

  const result = await sql`
    INSERT INTO projects (user_id, title, description, word_count_goal, status, visibility)
    VALUES (${userId}, ${title}, ${description}, ${wordCountGoal}, 'active', 'private')
    RETURNING id
  `;

  return { id: result[0].id };
}

export async function deleteProjectById(userId: string, projectId: string): Promise<boolean> {
  // Verify ownership
  const ownership = await sql`
    SELECT id FROM projects 
    WHERE id = ${projectId} AND user_id = ${userId}
  `;

  if (ownership.length === 0) {
    throw new Error('Project not found or not owned by user');
  }

  // Delete all related data in a transaction
  await sql.begin(async sql => {
    // Delete cascade through the project relationships
    await sql`DELETE FROM projects WHERE id = ${projectId}`;
  });

  return true;
}