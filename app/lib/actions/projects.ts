'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
  getProjectsByUserId, 
  createNewProject, 
  deleteProjectById 
} from '@/app/lib/services/projectService';
import { UnauthorizedError, BadRequestError, NotFoundError } from '@/app/lib/errors';
import { logAuditEvent } from '@/app/lib/auditLogger';
import { withAudit } from '@/app/lib/auditMiddleware';

const ProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(1, "Description is required"),
  word_count_goal: z.number().int().positive().default(50000),
});

export async function getProjects() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to access projects');
  }
  
  try {
    return await getProjectsByUserId(session.user.id);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
}

export async function createProject(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to create a project');
  }
  
  try {
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      word_count_goal: formData.get('word_count_goal') ? 
        Number(formData.get('word_count_goal')) : 50000,
    };
    
    const validatedData = ProjectSchema.parse(rawData);
    
    // const result = await createNewProject(
    //   session.user.id,
    //   validatedData.title,
    //   validatedData.description,
    //   validatedData.word_count_goal
    // );
    
    const result = await withAudit(
      session.user.id,
      'create',
      'project',
      'pending', // Will be replaced with actual ID in metadata
      async () => {
        const projectResult = await createNewProject(
          session.user.id,
          validatedData.title,
          validatedData.description,
          validatedData.word_count_goal
        );
        return projectResult;
      },
      { title: validatedData.title }
    );

    revalidatePath('/dashboard/studio');
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    throw error;
  }
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to delete a project');
  }
  
  try {
    // Use withAudit to wrap the operation
    await withAudit(
      session.user.id,
      'delete',
      'project',
      projectId,
      async () => {
        return await deleteProjectById(session.user.id, projectId);
      },
      { projectId } // Additional metadata
    );
    
    revalidatePath('/dashboard/studio');
    return { success: true };
  } catch (error) {
    throw error;
  }
}