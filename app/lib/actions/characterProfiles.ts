// app/lib/actions/characterProfiles.ts
import { auth } from '@/auth';
import { UnauthorizedError, BadRequestError } from '@/app/lib/errors';
import { withAudit } from '@/app/lib/auditMiddleware';
import { NFTCharacterProfile } from '@/app/lib/definitions';
import { 
  getCharacterProfileByNftId, 
  createCharacterProfile, 
  updateCharacterProfile,
  getCompletedCharacterProfiles 
} from '@/app/lib/services/characterProfileService';

export async function getCharacterProfile(nftId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view character profiles');
  }
  
  try {
    return await getCharacterProfileByNftId(nftId);
  } catch (error) {
    console.error('Failed to fetch character profile:', error);
    throw error;
  }
}

export async function createProfile(assetId: string, formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to create character profiles');
  }
  
  try {
    const profileData: Partial<NFTCharacterProfile> = {
      character_name: formData.get('character_name') as string,
      character_description: formData.get('character_description') as string,
      backstory: formData.get('backstory') as string,
      role_in_story: formData.get('role_in_story') as string,
      visual_appearance: formData.get('visual_appearance') as string,
      is_protagonist: formData.get('is_protagonist') === 'true',
      is_antagonist: formData.get('is_antagonist') === 'true',
      is_supporting: formData.get('is_supporting') === 'true',
      personality_traits: formData.get('personality_traits') ? 
        JSON.parse(formData.get('personality_traits') as string) : {}
    };
    
    return await withAudit(
      session.user.id,
      'create',
      'character_profile',
      assetId,
      async () => {
        return await createCharacterProfile(session.user.id, assetId, profileData);
      },
      { assetId }
    );
  } catch (error) {
    console.error('Failed to create character profile:', error);
    throw error;
  }
}

export async function updateProfile(profileId: string, formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to update character profiles');
  }
  
  try {
    const profileData: Partial<NFTCharacterProfile> = {
      character_name: formData.get('character_name') as string,
      character_description: formData.get('character_description') as string,
      backstory: formData.get('backstory') as string,
      role_in_story: formData.get('role_in_story') as string,
      visual_appearance: formData.get('visual_appearance') as string,
      is_protagonist: formData.get('is_protagonist') === 'true',
      is_antagonist: formData.get('is_antagonist') === 'true',
      is_supporting: formData.get('is_supporting') === 'true',
      personality_traits: formData.get('personality_traits') ? 
        JSON.parse(formData.get('personality_traits') as string) : undefined
    };
    
    return await withAudit(
      session.user.id,
      'update',
      'character_profile',
      profileId,
      async () => {
        return await updateCharacterProfile(session.user.id, profileId, profileData);
      },
      { profileId }
    );
  } catch (error) {
    console.error('Failed to update character profile:', error);
    throw error;
  }
}

export async function getUsableCharacterProfiles() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view character profiles');
  }
  
  try {
    return await getCompletedCharacterProfiles(session.user.id);
  } catch (error) {
    console.error('Failed to fetch usable character profiles:', error);
    throw error;
  }
}

export async function generateCharacterFromNFT(nftId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to generate character profiles');
  }
  
  try {
    // This would use AI to generate a character profile based on NFT attributes
    // For now, we'll return a placeholder implementation
    // In a real implementation, you would call an AI service
    
    // First, get the NFT metadata
    const nft = await getNFTMetadata(nftId);
    
    // Generate a basic profile based on attributes
    const profile = {
      character_name: `${nft.collection_name} #${nft.token_id}`,
      character_description: `A unique character from the ${nft.collection_name} collection.`,
      backstory: "This character has a mysterious past, waiting to be explored.",
      role_in_story: "This character can play various roles in your story.",
      visual_appearance: "The character's appearance matches their NFT artwork.",
      personality_traits: {},
      is_protagonist: false,
      is_antagonist: false,
      is_supporting: true
    };
    
    return profile;
  } catch (error) {
    console.error('Failed to generate character profile:', error);
    throw error;
  }
}

async function getNFTMetadata(nftId: string) {
  // This would retrieve the NFT metadata from your database
  // For now, we'll return a placeholder
  return {
    collection_name: "Example Collection",
    token_id: "123",
    attributes: []
  };
}