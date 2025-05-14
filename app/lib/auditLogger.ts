export async function logAuditEvent(
  userId: string, 
  action: string, 
  resourceType: string, 
  resourceId: string,
  metadata: Record<string, any> = {}
) {
  await sql`
    INSERT INTO audit_logs (
      user_id, 
      action, 
      resource_type, 
      resource_id, 
      ip_address,
      metadata, 
      created_at
    ) VALUES (
      ${userId},
      ${action},
      ${resourceType},
      ${resourceId},
      ${metadata.ipAddress || null},
      ${JSON.stringify(metadata)},
      NOW()
    )
  `;
}