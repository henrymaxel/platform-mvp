'use server';

import { auth } from '@/auth';
import { sql } from '@/app/lib/database';
import { UnauthorizedError } from '@/app/lib/errors';
import { withAudit } from '@/app/lib/auditMiddleware';

export async function getUserNFTs() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to view your NFTs');
  }
  
  try {
    const result = await sql`
      SELECT 
        un.id,
        nc.name as collection_name,
        un.token_id,
        un.character_name,
        un.character_bio,
        un.token_metadata->>'image' as image_url,
        uw.wallet_address
      FROM user_nfts un
      JOIN nft_collections nc ON un.collection_id = nc.id
      JOIN user_wallets uw ON un.wallet_id = uw.id
      WHERE un.user_id = ${session.user.id}
      ORDER BY nc.name, un.token_id::integer
    `;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch user NFTs:', error);
    throw error;
  }
}

export async function updateNFTCharacter(nftId: string, data: {
  character_name?: string;
  character_bio?: string;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in to update NFT character');
  }
  
  try {
    // Verify ownership
    const nftCheck = await sql`
      SELECT id FROM user_nfts
      WHERE id = ${nftId}
      AND user_id = ${session.user.id}
    `;
    
    if (nftCheck.length === 0) {
      throw new Error('NFT not found or not owned by user');
    }
    
    // Update character info
    await withAudit(
      session.user.id,
      'update',
      'nft_character',
      nftId,
      async () => {
        return await sql`
          UPDATE user_nfts
          SET 
            character_name = COALESCE(${data.character_name}, character_name),
            character_bio = COALESCE(${data.character_bio}, character_bio),
            updated_at = NOW()
          WHERE id = ${nftId}
          RETURNING id, character_name, character_bio
        `;
      },
      { nftId }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update NFT character:', error);
    throw error;
  }
}