// app/lib/services/projectAssetsService.ts
import { sql } from "@/app/lib/database";
import { SubscriptionTier } from "@/app/lib/definitions";

export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier | null> {
  try {
    const result = await sql`
      SELECT st.*
      FROM subscription_tiers st
      JOIN users u ON u.subscription_tier_id = st.id
      WHERE u.id = ${userId}
    `;
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to fetch user subscription tier:', error);
    throw error;
  }
}

export async function getProjectAssets(projectId: string): Promise<any[]> {
  try {
    const result = await sql`
      SELECT pa.id, pa.project_id, a.id as asset_id, 
        a.name, a.backstory, a.smart_contract_address, a.token_id,
        un.id as nft_id, un.collection_id, un.token_id as nft_token_id,
        nc.name as collection_name
      FROM project_assets pa
      JOIN assets a ON pa.asset_id = a.id
      JOIN user_nfts un ON a.user_nft_id = un.id
      JOIN nft_collections nc ON un.collection_id = nc.id
      WHERE pa.project_id = ${projectId}
    `;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch project assets:', error);
    throw error;
  }
}

export async function addAssetToProject(
  userId: string,
  projectId: string,
  assetId: string
): Promise<boolean> {
  try {
    // Check if this user owns the project
    const projectCheck = await sql`
      SELECT id FROM projects
      WHERE id = ${projectId} AND user_id = ${userId}
    `;
    
    if (projectCheck.length === 0) {
      throw new Error('Project not found or not owned by user');
    }
    
    // Check if the user owns the asset
    const assetCheck = await sql`
      SELECT a.id
      FROM assets a
      JOIN user_nfts un ON a.user_nft_id = un.id
      WHERE a.id = ${assetId} AND un.user_id = ${userId}
    `;
    
    if (assetCheck.length === 0) {
      throw new Error('Asset not found or not owned by user');
    }
    
    // Check subscription limits
    const tier = await getUserSubscriptionTier(userId);
    const currentAssetCount = await sql`
      SELECT COUNT(*) as count
      FROM project_assets pa
      WHERE pa.project_id = ${projectId}
    `;
    
    const assetLimit = tier?.max_assets_per_project || 1; // Default to 1 for free tier
    
    if (parseInt(currentAssetCount[0].count) >= assetLimit) {
      throw new Error(`You've reached the asset limit (${assetLimit}) for your subscription tier`);
    }
    
    // Add asset to project
    await sql`
      INSERT INTO project_assets (project_id, asset_id, created_at)
      VALUES (${projectId}, ${assetId}, NOW())
      ON CONFLICT (project_id, asset_id) DO NOTHING
    `;
    
    return true;
  } catch (error) {
    console.error('Failed to add asset to project:', error);
    throw error;
  }
}

export async function removeAssetFromProject(
  userId: string,
  projectId: string,
  assetId: string
): Promise<boolean> {
  try {
    // Check if this user owns the project
    const projectCheck = await sql`
      SELECT id FROM projects
      WHERE id = ${projectId} AND user_id = ${userId}
    `;
    
    if (projectCheck.length === 0) {
      throw new Error('Project not found or not owned by user');
    }
    
    // Remove asset from project
    await sql`
      DELETE FROM project_assets
      WHERE project_id = ${projectId} AND asset_id = ${assetId}
    `;
    
    return true;
  } catch (error) {
    console.error('Failed to remove asset from project:', error);
    throw error;
  }
}