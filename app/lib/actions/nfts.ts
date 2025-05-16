'use server';

import { auth } from '@/auth';
import { sql } from '@/app/lib/database';
import { UnauthorizedError, BadRequestError, NotFoundError } from '@/app/lib/errors';
import { withAudit } from '@/app/lib/auditMiddleware';
import { z } from 'zod';
import { verifyNftOwnership } from '../services/alchemyService';

// Validation schemas
const CharacterProfileSchema = z.object({
  nftId: z.string().uuid(),
  character_name: z.string().min(1, 'Character name is required'),
  character_description: z.string().optional(),
  personality_traits: z.array(z.string()).default([]),
  backstory: z.string().optional(),
  role_in_story: z.string().optional(),
  visual_appearance: z.string().optional(),
  is_protagonist: z.boolean().default(false),
  is_antagonist: z.boolean().default(false),
  is_supporting: z.boolean().default(true)
});

/**
 * Get all NFTs owned by the current user
 */
export async function getUserNfts() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view your NFTs');
  }
  
  try {
    const result = await sql`
      SELECT 
        un.id,
        un.collection_id,
        nc.name as collection_name,
        un.token_id,
        un.token_metadata,
        uw.wallet_address,
        uw.chain_id,
        un.last_verified_at,
        (SELECT COUNT(*) > 0 FROM nft_character_profiles WHERE asset_id IN (
          SELECT id FROM assets WHERE user_nft_id = un.id
        )) as has_character_profile
      FROM user_nfts un
      JOIN nft_collections nc ON un.collection_id = nc.id
      JOIN user_wallets uw ON un.wallet_id = uw.id
      WHERE un.user_id = ${session.user.id}
      ORDER BY un.last_verified_at DESC
    `;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch user NFTs:', error);
    throw error;
  }
}

/**
 * Get details for a specific NFT
 */
export async function getNftDetails(nftId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view NFT details');
  }
  
  try {
    // Get NFT details
    const nftResult = await sql`
      SELECT 
        un.id,
        un.collection_id,
        nc.name as collection_name,
        un.token_id,
        un.token_metadata,
        uw.wallet_address,
        uw.chain_id,
        un.last_verified_at
      FROM user_nfts un
      JOIN nft_collections nc ON un.collection_id = nc.id
      JOIN user_wallets uw ON un.wallet_id = uw.id
      WHERE un.id = ${nftId}
      AND un.user_id = ${session.user.id}
    `;
    
    if (nftResult.length === 0) {
      throw new NotFoundError('NFT not found or not owned by user');
    }
    
    const nft = nftResult[0];
    
    // Check if we have an asset and character profile for this NFT
    const assetResult = await sql`
      SELECT a.id as asset_id
      FROM assets a
      WHERE a.user_nft_id = ${nftId}
      LIMIT 1
    `;
    
    let characterProfile = null;
    if (assetResult.length > 0) {
      const profileResult = await sql`
        SELECT 
          ncp.id,
          ncp.character_name,
          ncp.character_description,
          ncp.personality_traits,
          ncp.backstory,
          ncp.role_in_story,
          ncp.visual_appearance,
          ncp.is_protagonist,
          ncp.is_antagonist,
          ncp.is_supporting
        FROM nft_character_profiles ncp
        WHERE ncp.asset_id = ${assetResult[0].asset_id}
        AND ncp.user_id = ${session.user.id}
      `;
      
      if (profileResult.length > 0) {
        characterProfile = profileResult[0];
      }
    }
    
    return {
      ...nft,
      character_profile: characterProfile
    };
  } catch (error) {
    console.error('Failed to fetch NFT details:', error);
    throw error;
  }
}

/**
 * Refresh NFT ownership verification
 */
export async function refreshNftOwnership(nftId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to refresh NFT ownership');
  }
  
  try {
    // Get NFT and wallet details
    const nftResult = await sql`
      SELECT 
        un.id,
        uw.wallet_address,
        uw.chain_id,
        nc.address as contract_address,
        un.token_id
      FROM user_nfts un
      JOIN user_wallets uw ON un.wallet_id = uw.id
      JOIN nft_collections nc ON un.collection_id = nc.id
      WHERE un.id = ${nftId}
      AND un.user_id = ${session.user.id}
    `;
    
    if (nftResult.length === 0) {
      throw new NotFoundError('NFT not found or not owned by user');
    }
    
    const nft = nftResult[0];
    
    // Use the Alchemy service to verify ownership
    const isOwned = await verifyNftOwnership(
      nft.wallet_address.toLowerCase(),
      nft.contract_address.toLowerCase(),
      nft.token_id,
      nft.chain_id
    );
    
    if (!isOwned) {
      throw new BadRequestError('This NFT is no longer owned by the connected wallet');
    }
    
    // Update the last verification timestamp
    await sql`
      UPDATE user_nfts
      SET last_verified_at = NOW()
      WHERE id = ${nftId}
    `;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to refresh NFT ownership:', error);
    throw error;
  }
}

/**
 * Remove an NFT from the user's collection
 */
export async function deleteUserNft(nftId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to remove an NFT');
  }
  
  try {
    // Verify that the NFT belongs to the user
    const nft = await sql`
      SELECT id FROM user_nfts
      WHERE id = ${nftId}
      AND user_id = ${session.user.id}
    `;
    
    if (nft.length === 0) {
      throw new NotFoundError('NFT not found or not owned by user');
    }
    
    // Start a transaction to delete the NFT and related data
    await sql.begin(async (sql) => {
      // Delete character profiles first
      await sql`
        DELETE FROM nft_character_profiles
        WHERE asset_id IN (
          SELECT id FROM assets
          WHERE user_nft_id = ${nftId}
        )
      `;
      
      // Delete asset references in projects
      await sql`
        DELETE FROM project_assets
        WHERE asset_id IN (
          SELECT id FROM assets
          WHERE user_nft_id = ${nftId}
        )
      `;
      
      // Delete the asset
      await sql`
        DELETE FROM assets
        WHERE user_nft_id = ${nftId}
      `;
      
      // Finally, delete the user NFT
      await sql`
        DELETE FROM user_nfts
        WHERE id = ${nftId}
        AND user_id = ${session.user.id}
      `;
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete NFT:', error);
    throw error;
  }
}

/**
 * Save or update a character profile for an NFT
 */
export async function saveCharacterProfile(data: any) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to save a character profile');
  }
  
  try {
    // Validate the data
    const validatedData = CharacterProfileSchema.parse(data);
    
    // Verify that the NFT belongs to the user
    const nftResult = await sql`
      SELECT id FROM user_nfts
      WHERE id = ${validatedData.nftId}
      AND user_id = ${session.user.id}
    `;
    
    if (nftResult.length === 0) {
      throw new NotFoundError('NFT not found or not owned by user');
    }
    
    // Check if we already have an asset for this NFT
    let assetId = null;
    const assetResult = await sql`
      SELECT id FROM assets
      WHERE user_nft_id = ${validatedData.nftId}
    `;
    
    if (assetResult.length > 0) {
      assetId = assetResult[0].id;
    } else {
      // Create a new asset
      const assetResult = await sql`
        INSERT INTO assets (
          name,
          associated_project_id,
          user_nft_id,
          platform_owned,
          created_at,
          updated_at
        ) VALUES (
          ${validatedData.character_name},
          NULL,
          ${validatedData.nftId},
          false,
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      
      assetId = assetResult[0].id;
    }
    
    // Check if we already have a character profile for this asset
    const profileResult = await sql`
      SELECT id FROM nft_character_profiles
      WHERE asset_id = ${assetId}
      AND user_id = ${session.user.id}
    `;
    
    if (profileResult.length > 0) {
      // Update the existing profile
      await sql`
        UPDATE nft_character_profiles
        SET 
          character_name = ${validatedData.character_name},
          character_description = ${validatedData.character_description || ''},
          personality_traits = ${JSON.stringify(validatedData.personality_traits)},
          backstory = ${validatedData.backstory || ''},
          role_in_story = ${validatedData.role_in_story || ''},
          visual_appearance = ${validatedData.visual_appearance || ''},
          is_protagonist = ${validatedData.is_protagonist},
          is_antagonist = ${validatedData.is_antagonist},
          is_supporting = ${validatedData.is_supporting},
          updated_at = NOW()
        WHERE id = ${profileResult[0].id}
      `;
      
      // Also update the asset name
      await sql`
        UPDATE assets
        SET name = ${validatedData.character_name},
            updated_at = NOW()
        WHERE id = ${assetId}
      `;
      
      return { id: profileResult[0].id, asset_id: assetId };
    } else {
      // Create a new character profile
      const newProfile = await sql`
        INSERT INTO nft_character_profiles (
          asset_id,
          user_id,
          character_name,
          character_description,
          personality_traits,
          backstory,
          role_in_story,
          visual_appearance,
          is_protagonist,
          is_antagonist,
          is_supporting,
          created_at,
          updated_at
        ) VALUES (
          ${assetId},
          ${session.user.id},
          ${validatedData.character_name},
          ${validatedData.character_description || ''},
          ${JSON.stringify(validatedData.personality_traits)},
          ${validatedData.backstory || ''},
          ${validatedData.role_in_story || ''},
          ${validatedData.visual_appearance || ''},
          ${validatedData.is_protagonist},
          ${validatedData.is_antagonist},
          ${validatedData.is_supporting},
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      
      return { id: newProfile[0].id, asset_id: assetId };
    }
  } catch (error) {
    console.error('Failed to save character profile:', error);
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    throw error;
  }
}

/**
 * Get all character profiles for a user
 */
export async function getUserCharacterProfiles() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view character profiles');
  }
  
  try {
    const result = await sql`
      SELECT 
        ncp.id,
        ncp.character_name,
        ncp.character_description,
        ncp.is_protagonist,
        ncp.is_antagonist,
        ncp.is_supporting,
        a.id as asset_id,
        a.name as asset_name,
        un.token_metadata,
        nc.name as collection_name
      FROM nft_character_profiles ncp
      JOIN assets a ON ncp.asset_id = a.id
      JOIN user_nfts un ON a.user_nft_id = un.id
      JOIN nft_collections nc ON un.collection_id = nc.id
      WHERE ncp.user_id = ${session.user.id}
      ORDER BY ncp.updated_at DESC
    `;
    
    // Process the data
    const processedProfiles = result.map((profile: any) => {
      // Extract image URL from token_metadata
      const metadata = profile.token_metadata || {};
      const imageUrl = metadata.image || metadata.image_url || '/placeholder-nft.png';
      
      return {
        ...profile,
        image_url: imageUrl
      };
    });
    
    return processedProfiles;
  } catch (error) {
    console.error('Failed to fetch character profiles:', error);
    throw error;
  }
}

/**
 * Get available character profiles for a project
 * This takes into account subscription limits
 */
export async function getAvailableCharactersForProject(projectId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view available characters');
  }
  
  try {
    // Get the user's subscription tier
    const subscriptionResult = await sql`
      SELECT 
        st.max_assets_per_project
      FROM users u
      JOIN subscription_tiers st ON u.subscription_tier_id = st.id
      WHERE u.id = ${session.user.id}
    `;
    
    if (subscriptionResult.length === 0) {
      throw new Error('Subscription information not found');
    }
    
    const maxAssetsAllowed = subscriptionResult[0].max_assets_per_project || 1;
    
    // Get currently assigned assets to the project
    const assignedAssetsResult = await sql`
      SELECT 
        pa.asset_id
      FROM project_assets pa
      JOIN projects p ON pa.project_id = p.id
      WHERE p.id = ${projectId}
      AND p.user_id = ${session.user.id}
    `;
    
    const assignedAssetIds = assignedAssetsResult.map((row: any) => row.asset_id);
    const canAddMore = assignedAssetIds.length < maxAssetsAllowed;
    
    // Get all character profiles
    const characterProfiles = await getUserCharacterProfiles();
    
    return {
      characters: characterProfiles,
      assigned: assignedAssetIds,
      maxAllowed: maxAssetsAllowed,
      canAddMore
    };
  } catch (error) {
    console.error('Failed to fetch available characters:', error);
    throw error;
  }
}

/**
 * Add a character to a project
 */
export async function addCharacterToProject(projectId: string, assetId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to add a character to a project');
  }
  
  try {
    // Verify project ownership
    const projectResult = await sql`
      SELECT id FROM projects
      WHERE id = ${projectId}
      AND user_id = ${session.user.id}
    `;
    
    if (projectResult.length === 0) {
      throw new NotFoundError('Project not found or not owned by user');
    }
    
    // Verify asset ownership
    const assetResult = await sql`
      SELECT a.id
      FROM assets a
      JOIN user_nfts un ON a.user_nft_id = un.id
      WHERE a.id = ${assetId}
      AND un.user_id = ${session.user.id}
    `;
    
    if (assetResult.length === 0) {
      throw new NotFoundError('Asset not found or not owned by user');
    }
    
    // Check subscription limits
    const { canAddMore } = await getAvailableCharactersForProject(projectId);
    
    if (!canAddMore) {
      throw new BadRequestError('You have reached the maximum number of assets allowed for this project');
    }
    
    // Check if the asset is already added to the project
    const existingAssignment = await sql`
      SELECT id FROM project_assets
      WHERE project_id = ${projectId}
      AND asset_id = ${assetId}
    `;
    
    if (existingAssignment.length > 0) {
      // Asset already added, no need to do anything
      return { success: true };
    }
    
    // Add the asset to the project
    await sql`
      INSERT INTO project_assets (
        project_id,
        asset_id,
        created_at
      ) VALUES (
        ${projectId},
        ${assetId},
        NOW()
      )
    `;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to add character to project:', error);
    throw error;
  }
}

/**
 * Remove a character from a project
 */
export async function removeCharacterFromProject(projectId: string, assetId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to remove a character from a project');
  }
  
  try {
    // Verify project ownership
    const projectResult = await sql`
      SELECT id FROM projects
      WHERE id = ${projectId}
      AND user_id = ${session.user.id}
    `;
    
    if (projectResult.length === 0) {
      throw new NotFoundError('Project not found or not owned by user');
    }
    
    // Remove the asset from the project
    await sql`
      DELETE FROM project_assets
      WHERE project_id = ${projectId}
      AND asset_id = ${assetId}
    `;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to remove character from project:', error);
    throw error;
  }
}

/**
 * Get characters for a specific project
 */
export async function getProjectCharacters(projectId: string) {
    const session = await auth();
    if(!session?.user?.id) {
        throw new UnauthorizedError('You must be logged in to view project characters');
    }

    try {
        const assetResult = await sql`
            SELECT 
                a.id as assset_id
            FROM project_assets pa
            JOIN assets a ON pa.asset_id = a.id
            JOIN projects p ON pa.project_id = p.id
            WHERE p.id = ${projectId}
            AND p.user_id = ${session.user.id}
        `;

        if (assetResult.length === 0) {
            return [];
        }

        const assetIds = assetResult.map((row: any) => row.asset_id);
        const characterResult = await sql`
            SELECT
                ncp.id,
                ncp.asset_id,
                ncp.character_name,
                ncp.character_description,
                ncp.personality_tratis,
                ncp.backstory,
                ncp.role_in_story,
                ncp.visual_appearance,
                ncp.is_protagonist,
                ncp.is_antagonist,
                ncp.is_supporting,
                un.token_metadata,
                nc.name as collection_name
            FROM nft_character_profiles ncp
            JOIN assets a ON ncp.asset_id = a.id
            JOIN user_nfts un ON a.user_nft_id = un.id
            JOIN nft_collections nc ON un.collection_id = nc.id
            WHERE ncp.asset_id IN ${sql(assetIds)}
            AND ncp.user_id = ${session?.user?.id} 
        `; // ncp.user_id = ${session?.user?.id} will end up being problematic if an asset is sold and used by someone else

        const processedCharacters = characterResult.map((character: any) => {
            const metadata = character.token_metadata || {};
            const imageUrl = metadata.image || metadata.image_url || '/placeholder-nft.png';

            return {
                ...character,
                image_url: imageUrl
            };
        });
    } catch (error) {
        console.error('Failed to fetch project characters: ', error);
    }

}