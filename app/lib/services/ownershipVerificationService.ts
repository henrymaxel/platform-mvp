import { sql } from "@/app/lib/database";
import { Alchemy, Network } from "alchemy-sdk";

export async function verifyAllNFTOwnerships(): Promise<{ success: number; failed: number }> {
  try {
    // Get all user NFTs with wallets
    const nfts = await sql`
      SELECT 
        un.id,
        un.user_id,
        un.collection_id,
        un.token_id,
        un.wallet_id,
        nc.address as collection_address,
        nc.chain_id,
        uw.wallet_address
      FROM user_nfts un
      JOIN nft_collections nc ON un.collection_id = nc.id
      JOIN user_wallets uw ON un.wallet_id = uw.id
    `;
    
    let successCount = 0;
    let failedCount = 0;
    
    // Configure Alchemy
    const config = {
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    };
    const alchemy = new Alchemy(config);
    
    // Check each NFT
    for (const nft of nfts) {
      try {
        const isOwned = await verifyNFTOwnership(
          alchemy,
          nft.wallet_address,
          nft.collection_address,
          nft.token_id
        );
        
        if (isOwned) {
          // Update verification timestamp
          await sql`
            UPDATE user_nfts
            SET last_verified_at = NOW()
            WHERE id = ${nft.id}
          `;
          successCount++;
        } else {
          // Mark as potentially transferred
          await sql`
            UPDATE user_nfts
            SET last_verified_at = NOW(),
                ownership_lost = true
            WHERE id = ${nft.id}
          `;
          
          // Flag projects using this NFT
          await sql`
            INSERT INTO notifications (
              user_id,
              type,
              message,
              is_read,
              created_at
            ) VALUES (
              ${nft.user_id},
              'nft_ownership_changed',
              ${'Ownership verification failed for your NFT. If you have sold this NFT, please update your projects that use it.'},
              false,
              NOW()
            )
          `;
          
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to verify NFT ${nft.id}:`, error);
        failedCount++;
      }
    }
    
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Failed to verify NFT ownerships:', error);
    throw error;
  }
}

async function verifyNFTOwnership(
  alchemy: Alchemy,
  walletAddress: string,
  collectionAddress: string,
  tokenId: string
): Promise<boolean> {
  try {
    // Get the owner of the NFT
    const owner = await alchemy.nft.getOwnersForNft(collectionAddress, tokenId);
    
    // Check if the wallet address is in the owners list
    return owner.owners.some(
      address => address.toLowerCase() === walletAddress.toLowerCase()
    );
  } catch (error) {
    console.error('Failed to verify NFT ownership:', error);
    throw error;
  }
}

export async function handleRoyaltyDistribution(): Promise<void> {
  try {
    // Get all published works with assets
    const publishedWorks = await sql`
      SELECT 
        p.id as publication_id, 
        p.project_id,
        a.id as asset_id,
        un.id as nft_id,
        un.user_id as nft_owner_id,
        un.ownership_lost,
        uw.wallet_address
      FROM publications p
      JOIN project_assets pa ON pa.project_id = p.project_id
      JOIN assets a ON pa.asset_id = a.id
      JOIN user_nfts un ON a.user_nft_id = un.id
      JOIN user_wallets uw ON un.wallet_id = uw.id
      WHERE p.status = 'published'
    `;
    
    // Process each asset to ensure royalties are set correctly
    for (const asset of publishedWorks) {
      // Check if a royalty entry exists
      const existingRoyalty = await sql`
        SELECT id, user_id FROM royalties
        WHERE publication_id = ${asset.publication_id}
        AND asset_id = ${asset.asset_id}
      `;
      
      if (existingRoyalty.length === 0) {
        // Create new royalty entry
        await sql`
          INSERT INTO royalties (
            publication_id,
            user_id,
            asset_id,
            amount,
            split_percentage,
            type,
            payout_status,
            timestamp
          ) VALUES (
            ${asset.publication_id},
            ${asset.ownership_lost ? null : asset.nft_owner_id},
            ${asset.asset_id},
            0,
            1,
            'nft_usage',
            'pending',
            NOW()
          )
        `;
      } else if (asset.ownership_lost && existingRoyalty[0].user_id !== null) {
        // Update royalty to reflect ownership loss
        await sql`
          UPDATE royalties
          SET user_id = null
          WHERE id = ${existingRoyalty[0].id}
        `;
      } else if (!asset.ownership_lost && existingRoyalty[0].user_id === null) {
        // Update royalty to reflect ownership regain
        await sql`
          UPDATE royalties
          SET user_id = ${asset.nft_owner_id}
          WHERE id = ${existingRoyalty[0].id}
        `;
      }
    }
  } catch (error) {
    console.error('Failed to handle royalty distribution:', error);
    throw error;
  }
}