'use server';

import { auth } from '@/auth';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import { sql } from '@/app/lib/database';
import { UnauthorizedError, BadRequestError } from '@/app/lib/errors';
import { withAudit } from '@/app/lib/auditMiddleware';
import { Alchemy, Network } from 'alchemy-sdk';

const TRACKED_COLLECTIONS = [
    {
        address: '0xcd7ccf029cd8e4c81e18e892740ea9973238bc75', 
        name: 'Mutant Hounds: Fusion'
    },
    {
        address: '0x354634c4621cdfb7a25e6486cca1e019777d841b',
        name: 'Mutant Hounds'
    },
];

// Configure the Alchemy SDK
const config = {
    api: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
}

const alchemy = new Alchemy(config);

interface WalletConnectionData {
    address: string;
    chainId: number;
    walletType: string;
    message: string;
    signature: string;
    timestamp: number;
}

/**
 * Connect a wallet to a user account
 */
export async function connectWallet(data: {
    address: string;
    chainId: number;
    walletType: string;
    message: string;
    signature: string;
    timestamp: number;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new UnauthorizedError('You must be logged in to connect a wallet');
    }

    try {
        // Validate the signature
        const msgBufferHex = bufferToHex(Buffer.from(data.message, 'utf8'));
        const address = recoverPersonalSignature({
            data: msgBufferHex,
            signature: data.signature,
        });

        // Check if the recovered address matches the provided address
        if (address.toLowerCase() !== data.address.toLowerCase()) {
            throw new BadRequestError('Invalid signature');
        }

        // Check if the wallet is already connected to this user
        const existingWallet = await sql`
            SELECT id FROM user_wallets
            WHERE user_id = ${session.user.id}
            AND wallet_address = ${data.address.toLowerCase()}
            AND chain_id = ${data.chainId}
        `;

        let walletId;

        if (existingWallet.length > 0) {
            // Wallet already connected, update the timestamp
            await sql`
                UPDATE user_wallets
                SET updated_at = NOW(),
                    is_primary = CASE 
                      WHEN (SELECT COUNT(*) FROM user_wallets WHERE user_id = ${session.user.id}) = 0
                      THEN true
                      ELSE is_primary
                    END
                WHERE id = ${existingWallet[0].id}
            `;

            walletId = existingWallet[0].id;
        } else {
            // Check if this is the first wallet for this user
            const walletCount = await sql`
                SELECT COUNT(*) as count FROM user_wallets
                WHERE user_id = ${session.user.id}
            `;

            const isPrimary = walletCount[0].count === 0;

            // Create a new wallet record
            const result = await withAudit(
                session.user.id,
                'connect',
                'wallet',
                'pending',
                async () => {
                    const walletResult = await sql`
                        INSERT INTO user_wallets (
                          user_id,
                          wallet_address,
                          chain_id,
                          wallet_type,
                          is_primary,
                          created_at,
                          updated_at
                        ) VALUES (
                          ${session.user.id},
                          ${data.address.toLowerCase()},
                          ${data.chainId},
                          ${data.walletType},
                          ${isPrimary},
                          NOW(),
                          NOW()
                        )
                        RETURNING id
                    `;
                    return walletResult[0];
                },
                {
                    wallet_address: data.address.toLowerCase(),
                    chain_id: data.chainId,
                    wallet_type: data.walletType
                }
            );

            walletId = result.id;
        }

        // After connecting a wallet, initiate NFT verification
        await verifyNFTsForWallet(session.user.id, data.address, walletId);

        return { id: walletId };
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
    }
}
/**
 * Get connected wallets for the current user
 */
export async function getConnectedWallets() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new UnauthorizedError('You must be logged in to view connected wallets');
    }

    try {
        const result = await sql`
      SELECT id, wallet_address, chain_id, wallet_type, is_primary, created_at, updated_at
      FROM user_wallets
      WHERE user_id = ${session.user.id}
      ORDER BY is_primary DESC, created_at DESC
    `;

        return result;
    } catch (error) {
        console.error('Failed to fetch connected wallets:', error);
        throw error;
    }
}

/**
 * Disconnect a wallet from a user account
 */
export async function disconnectWallet(walletId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new UnauthorizedError('You must be logged in to disconnect a wallet');
    }

    try {
        // Verify that the wallet belongs to the user
        const wallet = await sql`
      SELECT id, is_primary FROM user_wallets
      WHERE id = ${walletId}
      AND user_id = ${session.user.id}
    `;

        if (wallet.length === 0) {
            throw new BadRequestError('Wallet not found or not owned by user');
        }

        // Start a transaction
        await sql.begin(async (sql) => {
            // If this is the primary wallet, we need to set a new primary wallet
            if (wallet[0].is_primary) {
                const nextWallet = await sql`
          SELECT id FROM user_wallets
          WHERE user_id = ${session.user.id}
          AND id != ${walletId}
          ORDER BY created_at ASC
          LIMIT 1
        `;

                if (nextWallet.length > 0) {
                    await sql`
            UPDATE user_wallets
            SET is_primary = true
            WHERE id = ${nextWallet[0].id}
          `;
                }
            }

            // Remove all NFTs associated with this wallet
            await sql`
        DELETE FROM user_nfts
        WHERE wallet_id = ${walletId}
      `;

            // Remove the wallet
            await sql`
        DELETE FROM user_wallets
        WHERE id = ${walletId}
        AND user_id = ${session.user.id}
      `;
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to disconnect wallet:', error);
        throw error;
    }
}

/**
 * Set a wallet as the primary wallet
 */
export async function setPrimaryWallet(walletId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new UnauthorizedError('You must be logged in to set a primary wallet');
    }

    try {
        // Verify that the wallet belongs to the user
        const wallet = await sql`
      SELECT id FROM user_wallets
      WHERE id = ${walletId}
      AND user_id = ${session.user.id}
    `;

        if (wallet.length === 0) {
            throw new BadRequestError('Wallet not found or not owned by user');
        }

        // Update all wallets to set the selected one as primary
        await sql`
      UPDATE user_wallets
      SET is_primary = (id = ${walletId})
      WHERE user_id = ${session.user.id}
    `;

        return { success: true };
    } catch (error) {
        console.error('Failed to set primary wallet:', error);
        throw error;
    }
}

/**
 * Verify NFTs for a connected wallet
 * This function is called after connecting a wallet
 * It specifically checks for NFTs from the MAYC contract
 */
async function verifyNFTsForWallet(
    userId: string,
    walletAddress: string, 
    walletId: string
) {
    try {
        console.log(`Checking for NFTs in wallet ${walletAddress}`);
        
        // Configure Alchemy
        const config = {
            apiKey: process.env.ALCHEMY_API_KEY,
            network: Network.ETH_MAINNET,
        };
        const alchemy = new Alchemy(config);
        
        // Get all NFTs for the wallet
        const response = await alchemy.nft.getNftsForOwner(walletAddress.toLowerCase());
        
        console.log(`Found ${response.ownedNfts.length} NFTs in wallet ${walletAddress}`);
        
        // Filter NFTs from tracked collections
        for (const collection of TRACKED_COLLECTIONS) {
            const collectionNFTs = response.ownedNfts.filter(
                nft => nft.contract.address.toLowerCase() === collection.address.toLowerCase()
            );
            
            if (collectionNFTs.length > 0) {
                console.log(`Found ${collectionNFTs.length} NFTs from ${collection.name}`);
                
                // Check if collection exists in database
                let collectionId = null;
                const existingCollection = await sql`
                    SELECT id FROM nft_collections
                    WHERE address = ${collection.address.toLowerCase()}
                `;
                
                if (existingCollection.length > 0) {
                    collectionId = existingCollection[0].id;
                } else {
                    // Create new collection record
                    const collectionResult = await sql`
                        INSERT INTO nft_collections (
                            name,
                            address,
                            chain_id,
                            token_standard,
                            is_verified,
                            created_at,
                            updated_at
                        ) VALUES (
                            ${collection.name},
                            ${collection.address.toLowerCase()},
                            1, -- Ethereum Mainnet
                            'ERC721',
                            true,
                            NOW(),
                            NOW()
                        )
                        RETURNING id
                    `;
                    
                    collectionId = collectionResult[0].id;
                }
                
                // Process each NFT in the collection
                for (const nft of collectionNFTs) {
                    const tokenId = parseInt(nft.tokenId, 16).toString();
                    
                    // Check if this NFT is already in the database
                    const existingNft = await sql`
                        SELECT id FROM user_nfts
                        WHERE user_id = ${userId}
                        AND collection_id = ${collectionId}
                        AND token_id = ${tokenId}
                    `;
                    
                    // Extract metadata for storage
                    const metadata = nft.rawMetadata || {};
                    
                    if (existingNft.length === 0) {
                        // Create new NFT record
                        await sql`
                            INSERT INTO user_nfts (
                                user_id,
                                collection_id,
                                token_id,
                                wallet_id,
                                token_metadata,
                                character_name,
                                last_verified_at,
                                created_at,
                                updated_at
                            ) VALUES (
                                ${userId},
                                ${collectionId},
                                ${tokenId},
                                ${walletId},
                                ${JSON.stringify(nft)},
                                ${metadata.name || `${collection.name} #${tokenId}`},
                                NOW(),
                                NOW(),
                                NOW()
                            )
                        `;
                        
                        console.log(`Added NFT #${tokenId} from ${collection.name} for user ${userId}`);
                    } else {
                        // Update existing NFT
                        await sql`
                            UPDATE user_nfts
                            SET wallet_id = ${walletId},
                                token_metadata = ${JSON.stringify(nft)},
                                last_verified_at = NOW(),
                                updated_at = NOW()
                            WHERE id = ${existingNft[0].id}
                        `;
                        
                        console.log(`Updated NFT #${tokenId} from ${collection.name} for user ${userId}`);
                    }
                }
            }
        }
        
        // Log the NFT verification
        await withAudit(
            userId,
            'verify',
            'nfts',
            walletId,
            async () => {
                return { success: true, count: response.ownedNfts.length };
            },
            {
                wallet_address: walletAddress.toLowerCase(),
                nft_count: response.ownedNfts.length
            }
        );
        
        return { success: true, count: response.ownedNfts.length };
    } catch (error) {
        console.error('Failed to verify NFTs:', error);
        // Don't throw here as this is an async background task
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}


/**
 * Manually trigger verification of MAYC NFTs for a wallet
 */
export async function verifyMAYC(walletId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new UnauthorizedError('You must be logged in to verify NFTs');
    }

    try {
        // Get wallet details
        const wallet = await sql`
      SELECT wallet_address, chain_id
      FROM user_wallets
      WHERE id = ${walletId}
      AND user_id = ${session.user.id}
    `;

        if (wallet.length === 0) {
            throw new BadRequestError('Wallet not found or not owned by user');
        }

        // Verify MAYC NFTs
        await verifyNFTsForWallet(
            session.user.id,
            wallet[0].wallet_address,
            wallet[0].chain_id,
            walletId
        );

        return { success: true };
    } catch (error) {
        console.error('Failed to verify MAYC NFTs:', error);
        throw error;
    }
}