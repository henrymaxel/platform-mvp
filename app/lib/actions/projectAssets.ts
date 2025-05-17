// app/lib/actions/projectAssets.ts
import { auth } from '@/auth';
import { UnauthorizedError } from '@/app/lib/errors';
import { withAudit } from '@/app/lib/auditMiddleware';
import {
  getUserSubscriptionTier,
  getProjectAssets,
  addAssetToProject,
  removeAssetFromProject
} from '@/app/lib/services/projectAssetsService';

export async function getUserAssetLimit() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to check subscription limits');
  }
  
  try {
    const tier = await getUserSubscriptionTier(session.user.id);
    return {
      maxAssets: tier?.max_assets_per_project || 1 // Default to 1 for free tier
    };
  } catch (error) {
    console.error('Failed to fetch user asset limit:', error);
    throw error;
  }
}

export async function getAssetsForProject(projectId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view project assets');
  }
  
  try {
    return await getProjectAssets(projectId);
  } catch (error) {
    console.error('Failed to fetch project assets:', error);
    throw error;
  }
}

export async function addAssetAction(projectId: string, assetId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to add assets to projects');
  }
  
  try {
    return await withAudit(
      session.user.id,
      'add',
      'project_asset',
      `${projectId}:${assetId}`,
      async () => {
        return await addAssetToProject(session.user.id, projectId, assetId);
      },
      { projectId, assetId }
    );
  } catch (error) {
    console.error('Failed to add asset to project:', error);
    throw error;
  }
}

export async function removeAssetAction(projectId: string, assetId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to remove assets from projects');
  }
  
  try {
    return await withAudit(
      session.user.id,
      'remove',
      'project_asset',
      `${projectId}:${assetId}`,
      async () => {
        return await removeAssetFromProject(session.user.id, projectId, assetId);
      },
      { projectId, assetId }
    );
  } catch (error) {
    console.error('Failed to remove asset from project:', error);
    throw error;
  }
}