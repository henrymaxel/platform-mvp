//app/lib/actions/publications.ts
'use server';

import { auth } from '@/auth';
import { 
  getPublicationsByUserId, 
  getPublicationById, 
  createPublication, 
  deletePublication,
  updateLibraryMetadata
} from '@/app/lib/services/publicationService';
import { UnauthorizedError, NotFoundError, ForbiddenError } from '@/app/lib/errors';
import { z } from 'zod';
import { withAudit } from '@/app/lib/auditMiddleware';
import { revalidatePath } from 'next/cache';

// Validation schemas
const PublicationSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  publisher: z.string().optional(),
  status: z.string().optional()
});

const MetadataSchema = z.object({
  publicationId: z.string().min(1, "Publication ID is required"),
  genre: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.string().optional(),
  language: z.string().optional(),
  readingTimeEstimate: z.number().optional()
});

/**
 * Get all publications for the current user
 */
export async function getUserPublications() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view publications');
  }
  
  try {
    return await getPublicationsByUserId(session.user.id);
  } catch (error) {
    console.error('Failed to fetch publications:', error);
    throw error;
  }
}

/**
 * Get a specific publication by ID
 */
export async function getPublication(publicationId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view publication');
  }
  
  try {
    return await getPublicationById(publicationId, session.user.id);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        throw new NotFoundError('Publication not found');
      } else if (error.message.includes('permission')) {
        throw new ForbiddenError('You do not have permission to view this publication');
      }
    }
    throw error;
  }
}

/**
 * Create a new publication
 */
export async function publishProject(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to publish');
  }
  
  try {
    // Extract and validate form data
    const data = {
      projectId: formData.get('projectId') as string,
      title: formData.get('title') as string,
      publisher: formData.get('publisher') as string,
      status: formData.get('status') as string
    };
    
    const validatedData = PublicationSchema.parse(data);
    
    // Use withAudit to wrap the operation and log it
    const result = await withAudit(
      session.user.id,
      'publish',
      'publication',
      'pending', // Will be replaced with the actual ID
      async () => {
        // Create the publication
        const publication = await createPublication(
          session.user.id,
          validatedData
        );
        
        // If metadata is provided, update it
        if (formData.has('genre') || formData.has('tags') || formData.has('description')) {
          const tags = formData.get('tags') ? 
            (formData.get('tags') as string).split(',').map(tag => tag.trim()) : 
            [];
          
          await updateLibraryMetadata(session.user.id, {
            publicationId: publication.id,
            genre: formData.get('genre') as string,
            tags,
            keywords: tags.join(', '),
            language: formData.get('language') as string || 'en',
            readingTimeEstimate: parseInt(formData.get('readingTimeEstimate') as string) || 0
          });
        }
        
        return publication;
      },
      { 
        title: validatedData.title, 
        projectId: validatedData.projectId 
      }
    );
    
    revalidatePath('/dashboard/settings/publications');
    revalidatePath('/dashboard/studio');
    
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0].message;
      console.error('Validation error:', errorMessage);
      throw new Error(errorMessage);
    }
    console.error('Failed to publish project:', error);
    throw error;
  }
}

/**
 * Delete a publication
 */
export async function removePublication(publicationId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to delete publications');
  }
  
  try {
    // Use withAudit to wrap the operation and log it
    await withAudit(
      session.user.id,
      'delete',
      'publication',
      publicationId,
      async () => {
        return await deletePublication(session.user.id, publicationId);
      },
      { publicationId }
    );
    
    revalidatePath('/dashboard/settings/publications');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete publication:', error);
    throw error;
  }
}

/**
 * Update library metadata for a publication
 */
export async function updatePublicationMetadata(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to update publication metadata');
  }
  
  try {
    // Extract and validate form data
    const publicationId = formData.get('publicationId') as string;
    
    if (!publicationId) {
      throw new Error('Publication ID is required');
    }
    
    // Create tags array from comma-separated list
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];
    
    const data = {
      publicationId,
      genre: formData.get('genre') as string,
      tags,
      keywords: formData.get('keywords') as string || tags.join(', '),
      language: formData.get('language') as string,
      readingTimeEstimate: parseInt(formData.get('readingTimeEstimate') as string) || 0
    };
    
    const validatedData = MetadataSchema.parse(data);
    
    // Use withAudit to wrap the operation and log it
    const result = await withAudit(
      session.user.id,
      'update',
      'publication_metadata',
      publicationId,
      async () => {
        return await updateLibraryMetadata(session.user.id, validatedData);
      },
      { 
        publicationId,
        genre: validatedData.genre 
      }
    );
    
    revalidatePath('/dashboard/settings/publications');
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0].message;
      console.error('Validation error:', errorMessage);
      throw new Error(errorMessage);
    }
    console.error('Failed to update publication metadata:', error);
    throw error;
  }
}