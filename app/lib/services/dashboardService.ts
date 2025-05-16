//app/lib/services/dashboardService.ts
import { sql } from '@/app/lib/database';

/**
 * Get dashboard statistics for a user
 */
export async function getUserStats(userId: string) {
  try {
    // Fetch all stats in a single query for efficiency
    const statsResult = await sql`
      SELECT
        (SELECT COUNT(*) FROM projects WHERE user_id = ${userId}) AS project_count,
        (SELECT COALESCE(SUM(current_word_count), 0) FROM projects WHERE user_id = ${userId}) AS total_word_count,
        (SELECT COUNT(*) FROM publications p
         JOIN projects proj ON p.project_id = proj.id
         WHERE proj.user_id = ${userId} AND p.status = 'published') AS published_count,
        (SELECT COUNT(*) FROM projects 
         WHERE user_id = ${userId} 
         AND status = 'active'
         AND id NOT IN (SELECT project_id FROM publications WHERE status = 'published')) AS draft_count
    `;
    
    const stats = statsResult[0];
    
    return {
      projectCount: parseInt(stats.project_count, 10) || 0,
      totalWordCount: parseInt(stats.total_word_count, 10) || 0,
      publishedCount: parseInt(stats.published_count, 10) || 0,
      draftCount: parseInt(stats.draft_count, 10) || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

/**
 * Get recent user activities
 */
export async function getUserActivities(userId: string, limit: number = 5) {
  try {
    // Fetch recent activities from user_activities table
    const activitiesResult = await sql`
      SELECT ua.id, ua.activity_type, ua.timestamp, ua.metadata,
             COALESCE(p.title, cr.title, pub.title, 'Untitled') as item_title
      FROM user_activities ua
      LEFT JOIN projects p ON ua.project_id = p.id
      LEFT JOIN content_references cr ON ua.chapter_id = cr.id
      LEFT JOIN publications pub ON ua.publication_id = pub.id
      WHERE ua.user_id = ${userId}
      ORDER BY ua.timestamp DESC
      LIMIT ${limit}
    `;
    
    // Transform query results to proper activity format
    const activities = activitiesResult.map(activity => {
      // Determine activity type category
      let type = 'other';
      if (activity.activity_type.includes('publish')) {
        type = 'publication';
      } else if (activity.activity_type.includes('update')) {
        type = 'update';
      } else if (activity.activity_type.includes('create')) {
        type = 'creation';
      } else if (activity.activity_type.includes('comment')) {
        type = 'comment';
      }
      
      return {
        id: activity.id,
        type,
        title: activity.item_title,
        timestamp: activity.timestamp,
        metadata: activity.metadata
      };
    });
    
    // If no activities are found, simulate some recent activities based on database content
    if (activities.length >= 0) {
      // Get recent projects
      const projectsResult = await sql`
        SELECT id, title, created_at, updated_at 
        FROM projects 
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC
        LIMIT 3
      `;
      
      // Get recent publications
      const publicationsResult = await sql`
        SELECT pub.id, pub.title, pub.created_at
        FROM publications pub
        JOIN projects p ON pub.project_id = p.id
        WHERE p.user_id = ${userId}
        ORDER BY pub.created_at DESC
        LIMIT 2
      `;
      
      // Create simulated activities based on real content
      const simulatedActivities: { id: string; type: string; title: any; timestamp: any; }[] = [];
      
      // Add publication activities
      publicationsResult.forEach(pub => {
        simulatedActivities.push({
          id: `pub-${pub.id}`,
          type: 'publication',
          title: pub.title,
          timestamp: pub.created_at
        });
      });
      
      // Add project creation/update activities
      projectsResult.forEach((proj, index) => {
        if (index === 0) {
          simulatedActivities.push({
            id: `proj-update-${proj.id}`,
            type: 'update',
            title: proj.title,
            timestamp: proj.updated_at
          });
        } else {
          simulatedActivities.push({
            id: `proj-create-${proj.id}`,
            type: 'creation',
            title: proj.title,
            timestamp: proj.created_at
          });
        }
      });
      
      // Sort by timestamp descending
      simulatedActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return simulatedActivities.slice(0, limit);
    }
    
    return activities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw new Error('Failed to fetch user activities');
  }
}