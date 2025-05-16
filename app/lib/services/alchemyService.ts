'use server';

import { Alchemy, Network } from 'alchemy-sdk';
import { loadEnvConfig } from '@next/env';

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: false });
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Map of chain IDs to Alchemy Network enum values
const CHAIN_ID_TO_NETWORK: Record<number, Network> = {
  1: Network.ETH_MAINNET,
  33139: Network.APECHAIN_MAINNET,
};

/**
 * Get an Alchemy SDK instance for a specific chain
 */
export async function getAlchemyInstance(chainId: number): Alchemy {
  const apiKey = process.env.ALCHEMY_API_KEY;
  
  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY environment variable is not set');
  }
  
  const network = CHAIN_ID_TO_NETWORK[chainId] || Network.ETH_MAINNET;
  
  const settings = {
    apiKey,
    network
  };
  
  return new Alchemy(settings);
}

/**
 * Get NFTs owned by a specific address
 * Specifically filtered by contract addresses if provided
 */
export async function getNftsForOwner(
  ownerAddress: string, 
  chainId: number,
  contractAddresses?: string[]
) {
  try {
    const alchemy = getAlchemyInstance(chainId);
    
    // Define options
    const options: any = {
      excludeFilters: ["SPAM"],
      pageSize: 100
    };
    
    // Add contract addresses filter if provided
    if (contractAddresses && contractAddresses.length > 0) {
      options.contractAddresses = contractAddresses;
    }
    
    console.log(`Fetching NFTs for ${ownerAddress} on chain ${chainId}`);
    if (contractAddresses) {
      console.log(`Filtering by contracts: ${contractAddresses.join(', ')}`);
    }
    
    // Get NFTs - Ensure alchemy is correctly initialized before calling methods
    if (!alchemy || !alchemy.nft) {
      throw new Error('Alchemy SDK not properly initialized. Check API key and network settings.');
    }
    
    let response = await alchemy.nft.getNftsForOwner(ownerAddress, options);
    console.log(`Found ${response.ownedNfts.length} NFTs`);
    
    return response;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw error;
  }
}

/**
 * Get contract metadata for an NFT collection
 */
export async function getContractMetadata(
  contractAddress: string,
  chainId: number
) {
  try {
    const alchemy = getAlchemyInstance(chainId);
    
    // Ensure alchemy is correctly initialized before calling methods
    if (!alchemy || !alchemy.nft) {
      throw new Error('Alchemy SDK not properly initialized. Check API key and network settings.');
    }
    
    console.log(`Fetching contract metadata for ${contractAddress} on chain ${chainId}`);
    const metadata = await alchemy.nft.getContractMetadata(contractAddress);
    
    return metadata;
  } catch (error) {
    console.error('Error fetching contract metadata:', error);
    // Return a default metadata object if there's an error
    return {
      name: 'Unknown Collection',
      symbol: '',
      totalSupply: '',
      tokenType: 'ERC721'
    };
  }
}

/**
 * Verify ownership of a specific NFT
 */
export async function verifyNftOwnership(
  ownerAddress: string,
  contractAddress: string,
  tokenId: string,
  chainId: number
): Promise<boolean> {
  try {
    const alchemy = getAlchemyInstance(chainId);
    
    // Ensure alchemy is correctly initialized
    if (!alchemy || !alchemy.nft) {
      throw new Error('Alchemy SDK not properly initialized. Check API key and network settings.');
    }
    
    console.log(`Verifying ownership of NFT ${contractAddress}:${tokenId} for ${ownerAddress} on chain ${chainId}`);
    
    // Get NFTs for this owner and contract
    const options = {
      contractAddresses: [contractAddress],
      excludeFilters: ["SPAM"]
    };
    
    const response = await alchemy.nft.getNftsForOwner(ownerAddress, options);
    
    // Check if the token ID is in the response
    // We need to handle different token ID formats (decimal vs hex)
    const ownedNft = response.ownedNfts.find(nft => {
      // Try to match token IDs in different formats
      const nftTokenId = nft.tokenId;
      const nftTokenIdDecimal = parseInt(nft.tokenId, 16).toString();
      
      return (
        nftTokenId === tokenId || 
        nftTokenIdDecimal === tokenId ||
        parseInt(tokenId, 16).toString() === nftTokenIdDecimal
      );
    });
    
    const isOwned = !!ownedNft;
    console.log(`NFT ${contractAddress}:${tokenId} ownership verified: ${isOwned}`);
    
    return isOwned;
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    throw error;
  }
}