import { sql } from '@/app/lib/database';
import { Chapter } from '@/app/lib/definitions';

export async function getChapterById(chapterId: string, userId: string): Promise<Chapter> {
  const result = await sql`
    SELECT cr.* 
    FROM content_references cr
    JOIN projects p ON cr.project_id = p.id
    WHERE cr.id = ${chapterId} AND p.user_id = ${userId}
  `;
  
  if (result.length === 0) {
    throw new Error('Chapter not found or not authorized');
  }
  
  return result[0];
}

export async function createNewChapter(
  userId: string,
  projectId: string,
  title: string,
  chapterNumber: number
): Promise<Chapter> {
  // Verify project ownership
  const projectOwnership = await sql`
    SELECT id FROM projects 
    WHERE id = ${projectId} AND user_id = ${userId}
  `;

  if (projectOwnership.length === 0) {
    throw new Error('Project not found or not owned by user');
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
      ${projectId},
      ${title},
      ${chapterNumber},
      ${`/storage/chapters/chapter_${chapterNumber}.md`},
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
      COALESCE(word_count, 0) as word_count,
      project_id,
      created_at,
      updated_at
  `;
  
  return result[0];
}

export async function updateChapterContent(
  userId: string,
  chapterId: string,
  content: string,
  wordCount: number
): Promise<Chapter> {
  // Verify ownership
  const ownership = await sql`
    SELECT cr.id 
    FROM content_references cr
    JOIN projects p ON cr.project_id = p.id
    WHERE cr.id = ${chapterId} AND p.user_id = ${userId}
  `;

  if (ownership.length === 0) {
    throw new Error('Chapter not found or not owned by user');
  }

  const result = await sql`
    UPDATE content_references 
    SET 
      content = ${content},
      word_count = ${wordCount},
      version_number = version_number + 1,
      updated_at = NOW()
    WHERE id = ${chapterId}
    RETURNING *
  `;
  
  return result[0];
}

export async function updateChapterTitle(
  userId: string,
  chapterId: string,
  title: string
): Promise<Chapter> {
  // Verify ownership
  const ownership = await sql`
    SELECT cr.id 
    FROM content_references cr
    JOIN projects p ON cr.project_id = p.id
    WHERE cr.id = ${chapterId} AND p.user_id = ${userId}
  `;

  if (ownership.length === 0) {
    throw new Error('Chapter not found or not owned by user');
  }

  const result = await sql`
    UPDATE content_references 
    SET 
      title = ${title},
      updated_at = NOW()
    WHERE id = ${chapterId}
    RETURNING *
  `;
  
  return result[0];
}