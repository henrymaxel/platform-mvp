import { sql } from "@/app/lib/database";
import { NFTCharacterProfile } from "@/app/lib/definitions";

export async function getCharacterProfileByNftId(nftId: string): Promise<NFTCharacterProfile | null> {
  try {
    const result = await sql`
      SELECT cp.*
      FROM nft_character_profiles cp
      JOIN assets a ON cp.asset_id = a.id
      WHERE a.user_nft_id = ${nftId}
    `;
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to fetch character profile:', error);
    throw error;
  }
}

export async function createCharacterProfile(
  userId: string,
  assetId: string,
  profileData: Partial<NFTCharacterProfile>
): Promise<NFTCharacterProfile> {
  // First check if this user owns the asset
  const assetCheck = await sql`
    SELECT a.id FROM assets a
    JOIN user_nfts un ON a.user_nft_id = un.id
    WHERE a.id = ${assetId} AND un.user_id = ${userId}
  `;
  
  if (assetCheck.length === 0) {
    throw new Error('Asset not found or not owned by user');
  }
  
  // Check if all required fields are filled to determine completeness
  const isComplete = !!(
    profileData.character_name && 
    profileData.character_description && 
    profileData.backstory && 
    profileData.role_in_story && 
    profileData.visual_appearance &&
    (profileData.is_protagonist || profileData.is_antagonist || profileData.is_supporting)
  );
  
  const result = await sql`
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
      ${userId},
      ${profileData.character_name || ''},
      ${profileData.character_description || ''},
      ${profileData.personality_traits ? JSON.stringify(profileData.personality_traits) : '{}'},
      ${profileData.backstory || ''},
      ${profileData.role_in_story || ''},
      ${profileData.visual_appearance || ''},
      ${profileData.is_protagonist || false},
      ${profileData.is_antagonist || false},
      ${profileData.is_supporting || false},
      NOW(),
      NOW()
    ) RETURNING *
  `;
  
  return result[0];
}

export async function updateCharacterProfile(
  userId: string,
  profileId: string,
  profileData: Partial<NFTCharacterProfile>
): Promise<NFTCharacterProfile> {
  // First check if this user owns the profile
  const profileCheck = await sql`
    SELECT id FROM nft_character_profiles
    WHERE id = ${profileId} AND user_id = ${userId}
  `;
  
  if (profileCheck.length === 0) {
    throw new Error('Profile not found or not owned by user');
  }
  
  // Check if all required fields are filled to determine completeness
  const currentProfile = await sql`
    SELECT * FROM nft_character_profiles
    WHERE id = ${profileId}
  `;
  
  const updatedProfile = {
    ...currentProfile[0],
    ...profileData
  };
  
  const isComplete = !!(
    updatedProfile.character_name && 
    updatedProfile.character_description && 
    updatedProfile.backstory && 
    updatedProfile.role_in_story && 
    updatedProfile.visual_appearance &&
    (updatedProfile.is_protagonist || updatedProfile.is_antagonist || updatedProfile.is_supporting)
  );
  
  const result = await sql`
    UPDATE nft_character_profiles
    SET
      character_name = ${profileData.character_name || currentProfile[0].character_name},
      character_description = ${profileData.character_description || currentProfile[0].character_description},
      personality_traits = ${profileData.personality_traits ? JSON.stringify(profileData.personality_traits) : currentProfile[0].personality_traits},
      backstory = ${profileData.backstory || currentProfile[0].backstory},
      role_in_story = ${profileData.role_in_story || currentProfile[0].role_in_story},
      visual_appearance = ${profileData.visual_appearance || currentProfile[0].visual_appearance},
      is_protagonist = ${profileData.is_protagonist !== undefined ? profileData.is_protagonist : currentProfile[0].is_protagonist},
      is_antagonist = ${profileData.is_antagonist !== undefined ? profileData.is_antagonist : currentProfile[0].is_antagonist},
      is_supporting = ${profileData.is_supporting !== undefined ? profileData.is_supporting : currentProfile[0].is_supporting},
      updated_at = NOW()
    WHERE id = ${profileId}
    RETURNING *
  `;
  
  return result[0];
}

export async function getCompletedCharacterProfiles(userId: string): Promise<NFTCharacterProfile[]> {
  try {
    const result = await sql`
      SELECT cp.*
      FROM nft_character_profiles cp
      WHERE cp.user_id = ${userId}
      AND cp.character_name IS NOT NULL
      AND cp.character_description IS NOT NULL
      AND cp.backstory IS NOT NULL
      AND cp.role_in_story IS NOT NULL
      AND cp.visual_appearance IS NOT NULL
      AND (cp.is_protagonist = true OR cp.is_antagonist = true OR cp.is_supporting = true)
    `;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch completed character profiles:', error);
    throw error;
  }
}