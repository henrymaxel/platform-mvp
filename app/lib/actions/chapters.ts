'use server';

import { auth } from '@/auth';
import { sql } from '@/app/lib/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ChapterSchema = z.object({
    project_id: z.string(),
    title: z.string().min(3),
    chapter_number: z.number().int().positive(),
});

const UpdateChapterSchema = z.object({
    content: z.string().optional(),
    word_count: z.number().int().min(0).optional(),
    title: z.string().min(3).optional(),
});

export async function createChapter(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const rawData = {
        project_id: formData.get('project_id'),
        title: formData.get('title'),
        chapter_number: Number(formData.get('chapter_number')),
    };

    const validatedData = ChapterSchema.parse(rawData);

    // Verify project ownership
    const projectOwnership = await sql `SELECT id FROM projects WHERE id = ${validatedData.project_id} AND user_id = ${session?.user.id}`;

    if (projectOwnership.length === 0) {
        throw new Error('Project not found');
    }

    // Create new chapter
    const result = await sql `
        INSERT INTO content_references (
            project_id,
            title,
            chapter_number,
            storage_path,
            content,
            word_count,
            version_number
        ) VALUES (
            ${validatedData.project_id},
            ${validatedData.title},
            ${validatedData.chapter_number},
            ${`/storage/chapters/chapter_${validatedData.chapter_number}.md`},
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

    revalidatePath('/dashboard/studio');
    return result[0];
}

export async function updateChapter(chapterId: string, data: FormData) {
    const session = await auth();
    if(!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const rawData = {
        // Convert null to undefined for optional fields
        content: data.get('content') ? data.get('content') as string : undefined,
        word_count: data.get('word_count') ? Number(data.get('word_count')) : undefined,
        title: data.get('title') ? data.get('title') as string : undefined,
    };

    const validatedData = UpdateChapterSchema.parse(rawData);

    // Verify ownership
    const ownership = await sql `
        SELECT cr.id
        FROM content_references cr
        JOIN projects p ON cr.project_id = p.id
        WHERE cr.id = ${chapterId} AND p.user_id = ${session?.user.id}
    `;

    if (ownership.length === 0) {
        throw new Error('Chapter not found');
    }

    // Build update query based on what's provided
    let updateQuery;
    if (validatedData.title !== undefined && validatedData.content !== undefined) {
        // If both title and content are provided
        updateQuery = sql`
            UPDATE content_references
            SET
                title = ${validatedData.title},
                content = ${validatedData.content},
                word_count = ${validatedData.word_count || 0},
                version_number = version_number + 1,
                updated_at = NOW()
            WHERE id = ${chapterId}
            RETURNING *
        `;
    } else if (validatedData.content !== undefined) {
        // If only content is provided
        updateQuery = sql`
            UPDATE content_references
            SET
                content = ${validatedData.content},
                word_count = ${validatedData.word_count || 0},
                version_number = version_number + 1,
                updated_at = NOW()
            WHERE id = ${chapterId}
            RETURNING *
        `;
    } else if (validatedData.title !== undefined) {
        // If only title is provided
        updateQuery = sql`
            UPDATE content_references
            SET
                title = ${validatedData.title},
                updated_at = NOW()
            WHERE id = ${chapterId}
            RETURNING *
        `;
    } else {
        throw new Error('No valid fields to update');
    }

    const result = await updateQuery;
    revalidatePath('/dashboard/studio');
    return result[0];
}

export async function getChapter(chapterId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const result = await sql `
        SELECT cr.*, p.user_id
        FROM content_references as cr
        JOIN projects p ON cr.project_id = p.id
        WHERE cr.id = ${chapterId} AND p.user_id = ${session?.user.id}
    `;

    if (result.length === 0) {
        throw new Error('Chapter not found');
    }

    return result[0];
}