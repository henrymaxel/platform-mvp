'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  getChapterById,
  createNewChapter,
  updateChapterContent,
  updateChapterTitle
} from '@/app/lib/services/chapterService';
import { UnauthorizedError, BadRequestError, NotFoundError } from '@/app/lib/errors';
import { withAudit } from '@/app/lib/auditMiddleware';

const ChapterSchema = z.object({
  project_id: z.string().min(1, "Project ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  chapter_number: z.number().int().positive(),
});

const UpdateChapterSchema = z.object({
  content: z.string().optional(),
  word_count: z.number().int().min(0).optional(),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
});

export async function createChapter(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to create a chapter');
  }

  try {
    const rawData = {
      project_id: formData.get('project_id') as string,
      title: formData.get('title') as string,
      chapter_number: Number(formData.get('chapter_number')),
    };

    const validatedData = ChapterSchema.parse(rawData);

    // Use withAudit to wrap the operation
    const newChapter = await withAudit(
      session.user.id,
      'create',
      'chapter',
      'pending', // Will be updated with actual chapter ID
      async () => {
        return await createNewChapter(
          session.user.id,
          validatedData.project_id,
          validatedData.title,
          validatedData.chapter_number
        );
      },
      { 
        title: validatedData.title, 
        project_id: validatedData.project_id 
      }
    );

    revalidatePath('/dashboard/studio');
    return newChapter;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    throw error;
  }
}

export async function updateChapter(chapterId: string, data: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to update a chapter');
  }

  try {
    const rawData = {
      content: data.get('content') ? data.get('content') as string : undefined,
      word_count: data.get('word_count') ? Number(data.get('word_count')) : undefined,
      title: data.get('title') ? data.get('title') as string : undefined,
    };

    const validatedData = UpdateChapterSchema.parse(rawData);

    // If content is being updated
    if (validatedData.content !== undefined && validatedData.word_count !== undefined) {
      // Use withAudit to wrap the operation
      const updatedChapter = await withAudit(
        session.user.id,
        'update',
        'chapter_content',
        chapterId,
        async () => {
          return await updateChapterContent(
            session.user.id,
            chapterId,
            validatedData.content!,
            validatedData.word_count!
          );
        },
        { word_count: validatedData.word_count }
      );
      
      revalidatePath('/dashboard/studio');
      return updatedChapter;
    }
    
    // If only title is being updated
    if (validatedData.title !== undefined) {
      // Use withAudit to wrap the operation
      const updatedChapter = await withAudit(
        session.user.id,
        'update',
        'chapter_title',
        chapterId,
        async () => {
          return await updateChapterTitle(
            session.user.id,
            chapterId,
            validatedData.title!
          );
        },
        { title: validatedData.title }
      );
      
      revalidatePath('/dashboard/studio');
      return updatedChapter;
    }
    
    throw new BadRequestError('No valid fields to update');
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    throw error;
  }
}

export async function getChapter(chapterId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view a chapter');
  }

  try {
    return await getChapterById(chapterId, session.user.id);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw new NotFoundError('Chapter not found');
    }
    throw error;
  }
}