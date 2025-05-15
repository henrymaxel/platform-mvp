import { logAuditEvent } from '@/app/lib/auditLogger';
import { sql } from '@/app/lib/database';

export async function withAudit<T>(
  userId: string, 
  action: string, 
  resourceType: string, 
  resourceId: string, 
  callback: () => Promise<any>,
  metadata: Record<string, any> = {}
): Promise<T> {
  try {
    // Execute the operation
    const result = await callback();
    
    // Log successful operation
    await logAuditEvent(userId, action, resourceType, resourceId, {
      success: true,
      ...metadata
    });
    
    return result;
  } catch (error) {
    // Log failed operation
    await logAuditEvent(userId, action, resourceType, resourceId, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...metadata
    });
    
    throw error;
  }
}