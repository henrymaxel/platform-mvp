//app/lib/services/publicationService.ts
import { sql } from '@/app/lib/database';
import { Publication } from '@/app/lib/definitions';
import { RowList, Row } from 'postgres';

/**
 * Get all publications by user ID
 */
export async function getPublicationsByUserId(userId: string): Promise<Publication[]> {
  try {
    const result = await sql`
      SELECT 
        p.id,
        p.title,
        p.status,
        p.first_edition_timestamp,
        p.created_at,
        p.updated_at,
        COALESCE((SELECT views_count FROM publication_metrics WHERE publication_id = p.id ORDER BY timestamp DESC LIMIT 1), 0) as views_count,
        COALESCE((SELECT unique_readers_count FROM publication_metrics WHERE publication_id = p.id ORDER BY timestamp DESC LIMIT 1), 0) as unique_readers_count,
        COALESCE((SELECT completion_rate FROM publication_metrics WHERE publication_id = p.id ORDER BY timestamp DESC LIMIT 1), 0) as completion_rate
      FROM publications p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.user_id = ${userId}
      ORDER BY 
        CASE WHEN p.status = 'published' THEN 1
             WHEN p.status = 'pending' THEN 2
             ELSE 3
        END,
        p.updated_at DESC
    `;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch publications:', error);
    throw new Error('Failed to fetch publications');
  }
}

/**
 * Get a publication by ID
 */
export async function getPublicationById(publicationId: string, userId: string) {
  try {
    const publicationResult = await sql`
      SELECT 
        p.*,
        proj.user_id as owner_id,
        (SELECT COUNT(*) FROM content_references WHERE project_id = p.project_id) as chapter_count,
        (SELECT COUNT(*) FROM reading_progress WHERE publication_id = p.id) as reader_count,
        COALESCE((SELECT views_count FROM publication_metrics WHERE publication_id = p.id ORDER BY timestamp DESC LIMIT 1), 0) as views_count,
        COALESCE((SELECT unique_readers_count FROM publication_metrics WHERE publication_id = p.id ORDER BY timestamp DESC LIMIT 1), 0) as unique_readers_count,
        COALESCE((SELECT completion_rate FROM publication_metrics WHERE publication_id = p.id ORDER BY timestamp DESC LIMIT 1), 0) as completion_rate
      FROM publications p
      JOIN projects proj ON p.project_id = proj.id
      WHERE p.id = ${publicationId}
    `;
    
    if (publicationResult.length === 0) {
      throw new Error('Publication not found');
    }
    
    const publication = publicationResult[0];
    
    // Check ownership or if publication is public
    if (publication.owner_id !== userId && publication.status !== 'published') {
      throw new Error('You do not have permission to view this publication');
    }
    
    // Fetch chapters if the user is the owner
    let chapters: RowList<Row[]> | never[] = [];
    if (publication.owner_id === userId) {
      chapters = await sql`
        SELECT 
          cr.id,
          cr.title,
          cr.chapter_number,
          cr.word_count,
          cr.updated_at
        FROM content_references cr
        WHERE cr.project_id = ${publication.project_id}
        ORDER BY cr.chapter_number ASC
      `;
    }
    
    // Get library metadata
    const metadata = await sql`
      SELECT * FROM library_metadata
      WHERE publication_id = ${publicationId}
    `;
    
    return {
      publication,
      chapters: publication.owner_id === userId ? chapters : [],
      metadata: metadata.length > 0 ? metadata[0] : null
    };
  } catch (error) {
    console.error('Failed to fetch publication:', error);
    throw error;
  }
}

/**
 * Create a new publication
 */
export async function createPublication(userId: string, data: {
  projectId: string;
  title: string;
  publisher?: string;
  status?: string;
}) {
  try {
    // Verify project ownership
    const projectCheck = await sql`
      SELECT id FROM projects
      WHERE id = ${data.projectId}
      AND user_id = ${userId}
    `;
    
    if (projectCheck.length === 0) {
      throw new Error('Project not found or not owned by user');
    }
    
    // Create new publication record
    const result = await sql`
      INSERT INTO publications (
        project_id,
        title,
        publisher,
        status,
        first_edition_timestamp,
        version,
        active,
        created_at,
        updated_at
      ) VALUES (
        ${data.projectId},
        ${data.title},
        ${data.publisher || 'The Boring Platform'},
        ${data.status || 'pending'},
        ${data.status === 'published' ? new Date() : null},
        ${'1.0'},
        ${true},
        NOW(),
        NOW()
      )
      RETURNING id, title, status, created_at, updated_at
    `;
    
    // Log activity
    await sql`
      INSERT INTO user_activities (
        user_id,
        activity_type,
        publication_id,
        project_id,
        timestamp,
        metadata
      ) VALUES (
        ${userId},
        ${'publication_created'},
        ${result[0].id},
        ${data.projectId},
        NOW(),
        ${JSON.stringify({ title: data.title })}
      )
    `;
    
    return result[0];
  } catch (error) {
    console.error('Failed to create publication:', error);
    throw error;
  }
}

/**
 * Delete a publication
 */
export async function deletePublication(userId: string, publicationId: string) {
  try {
    // Verify publication ownership
    const publicationCheck = await sql`
      SELECT p.id, p.title, proj.user_id, p.project_id
      FROM publications p
      JOIN projects proj ON p.project_id = proj.id
      WHERE p.id = ${publicationId}
    `;
    
    if (publicationCheck.length === 0) {
      throw new Error('Publication not found');
    }
    
    if (publicationCheck[0].user_id !== userId) {
      throw new Error('You do not have permission to delete this publication');
    }
    
    // Begin transaction
    await sql.begin(async (sql) => {
      // Log the activity before deleting
      await sql`
        INSERT INTO user_activities (
          user_id,
          activity_type,
          project_id,
          timestamp,
          metadata
        ) VALUES (
          ${userId},
          ${'publication_deleted'},
          ${publicationCheck[0].project_id},
          NOW(),
          ${JSON.stringify({ 
            publication_id: publicationId,
            title: publicationCheck[0].title
          })}
        )
      `;
      
      // Delete related records
      await sql`DELETE FROM publication_metrics WHERE publication_id = ${publicationId}`;
      await sql`DELETE FROM library_metadata WHERE publication_id = ${publicationId}`;
      await sql`DELETE FROM reading_progress WHERE publication_id = ${publicationId}`;
      await sql`DELETE FROM royalties WHERE publication_id = ${publicationId}`;
      
      // Finally delete the publication
      await sql`DELETE FROM publications WHERE id = ${publicationId}`;
    });
    
    return true;
  } catch (error) {
    console.error('Failed to delete publication:', error);
    throw error;
  }
}

/**
 * Create or update library metadata for a publication
 */
export async function updateLibraryMetadata(userId: string, data: {
  publicationId: string;
  genre?: string;
  tags?: string[];
  keywords?: string;
  language?: string;
  readingTimeEstimate?: number;
}) {
  try {
    // Verify publication ownership
    const publicationCheck = await sql`
      SELECT p.id 
      FROM publications p
      JOIN projects proj ON p.project_id = proj.id
      WHERE p.id = ${data.publicationId}
      AND proj.user_id = ${userId}
    `;
    
    if (publicationCheck.length === 0) {
      throw new Error('Publication not found or not owned by user');
    }
    
    // Upsert library metadata
    const result = await sql`
      INSERT INTO library_metadata (
        publication_id,
        genre,
        tags,
        keywords,
        language,
        reading_time_estimate,
        created_at,
        updated_at
      ) VALUES (
        ${data.publicationId},
        ${data.genre || 'fiction'},
        ${data.tags ? JSON.stringify(data.tags) : '[]'},
        ${data.keywords || ''},
        ${data.language || 'en'},
        ${data.readingTimeEstimate || 0},
        NOW(),
        NOW()
      )
      ON CONFLICT (publication_id) DO UPDATE
      SET
        genre = EXCLUDED.genre,
        tags = EXCLUDED.tags,
        keywords = EXCLUDED.keywords,
        language = EXCLUDED.language,
        reading_time_estimate = EXCLUDED.reading_time_estimate,
        updated_at = NOW()
      RETURNING *
    `;
    
    // Initialize publication metrics if needed
    await sql`
      INSERT INTO publication_metrics (
        publication_id,
        views_count,
        unique_readers_count,
        average_reading_time,
        completion_rate,
        timestamp
      ) VALUES (
        ${data.publicationId},
        0,
        0,
        0,
        0,
        NOW()
      )
      ON CONFLICT DO NOTHING
    `;
    
    return result[0];
  } catch (error) {
    console.error('Failed to update library metadata:', error);
    throw error;
  }
}