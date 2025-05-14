'use server';

import { auth } from '@/auth';
import { sql } from '@/app/lib/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ProjectSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(1),
    word_count_goal: z.number().int().positive().default(50000),
});

export async function getProjects() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    try {
        // Get user's subscription info
        const userInfo = await sql `
            SELECT 
                u.subscription_tier_id,
                st.name as tier_name,
                st.max_project_count
            FROM users u
            LEFT JOIN subscription_tiers st ON u.subscription_tier_id = st.id
            WHERE u.id = ${session?.user.id}
        `;

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
            WHERE p.user_id = ${session?.user.id}
            ORDER BY p.updated_at DESC;
        `;

        const projects = projectsResult;

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

                const chapters = chaptersResult;

                return {
                    ...project,
                    chapters: chapters
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
                current_project_count: projects.length
            }
        };

    } catch (error) {
        console.error('Failed to fetch projects: ', error);
        throw new Error('Failed to fetch projects');
    }
}

export async function createProject(formData: FormData) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            throw new Error('Unauthorized');
        }

        // Check user's subscription tier and current project count
        const userInfo = await sql`
            SELECT 
                u.subscription_tier_id,
                st.max_project_count,
                (SELECT COUNT(*) FROM projects WHERE user_id = u.id) as current_project_count
            FROM users u
            LEFT JOIN subscription_tiers st ON u.subscription_tier_id = st.id
            WHERE u.id = ${session?.user?.id} 
        `;

        const maxProjects = userInfo[0]?.max_project_count ?? 3;
        const currentProjects = userInfo[0]?.current_project_count || 0;

        if (currentProjects >= maxProjects) {
            throw new Error(`Project limit reached. Max: ${maxProjects}`);
        }

        const rawData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            word_count_goal: formData.get('word_count_goal') ?
                Number(formData.get('word_count_goal')) : 50000,
        };

        const validatedData = ProjectSchema.parse(rawData);

        const result = await sql`
            INSERT INTO projects (user_id, title, description, word_count_goal, status, visibility)
            VALUES (${session.user.id}, ${validatedData.title}, ${validatedData.description}, ${validatedData.word_count_goal}, 'active', 'private')
            RETURNING id
        `;

        const newProject = result[0];
        revalidatePath('/dashboard/studio');

        return { id: newProject.id };
    } catch (error) {
        console.error('Error creating project: ', error);
        throw new Error('Error creating project');
    }
}

export async function deleteProject(projectId: string) {
    const session = await auth();

    if(!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    try {
        // First verify the project belongs to the user
        const ownership = await sql`
            SELECT id FROM projects
            WHERE id = ${projectId} AND user_id = ${session.user.id}
        `;

        if (ownership.length === 0) {
            throw new Error('Project not found');
        }

        // Start a transaction to delete all related data
        await sql.begin(async sql => {
            // Delete all related data...
            await sql`DELETE FROM comments WHERE content_reference_id IN (SELECT id FROM content_references WHERE project_id = ${projectId})`;
            await sql`DELETE FROM reactions WHERE content_reference_id IN (SELECT id FROM content_references WHERE project_id = ${projectId})`;
            await sql`DELETE FROM feedback WHERE project_id = ${projectId}`;
            await sql`DELETE FROM draft_backups WHERE project_id = ${projectId}`;
            await sql`DELETE FROM ai_usage_logs WHERE project_id = ${projectId}`;
            await sql`DELETE FROM content_references WHERE project_id = ${projectId}`;
            await sql`DELETE FROM project_collaborators WHERE project_id = ${projectId}`;
            await sql`DELETE FROM project_assets WHERE project_id = ${projectId}`;
            await sql`DELETE FROM projects WHERE id = ${projectId}`;
        });

        revalidatePath('/dashboard/studio');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete project: ', error);
        throw new Error('Failed to delete project');
    }
}