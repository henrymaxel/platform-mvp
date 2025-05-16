'use client';

/**
 * Utilities for interacting with Ethereum wallets (MetaMask, etc.)
 */

interface EthereumWindow extends Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: (...args: any[]) => void) => void;
    selectedAddress?: string;
    chainId?: string;
  };
}

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  const { ethereum } = window as EthereumWindow;
  return ethereum?.isMetaMask || false;
};

/**
 * Request account access
 */
export const requestAccounts = async (): Promise<string[]> => {
  const { ethereum } = window as EthereumWindow;
  
  if (!ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
  }
  
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
  } catch (error) {
    console.error('User denied account access', error);
    throw new Error('You need to allow MetaMask access to connect your wallet.');
  }
};

/**
 * Get the current chain ID
 */
export const getChainId = async (): Promise<number> => {
  const { ethereum } = window as EthereumWindow;
  
  if (!ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Failed to get chain ID', error);
    throw new Error('Failed to get chain ID');
  }
};

/**
 * Sign a message with the currently selected account
 */
export const signMessage = async (message: string, address: string): Promise<string> => {
  const { ethereum } = window as EthereumWindow;
  
  if (!ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const signature = await ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });
    
    return signature;
  } catch (error) {
    console.error('User denied signing', error);
    throw new Error('You need to sign the message to verify wallet ownership');
  }
};

/**
 * Switch to a specific Ethereum chain
 */
export const switchChain = async (chainId: number): Promise<boolean> => {
  const { ethereum } = window as EthereumWindow;
  
  if (!ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  const chainIdHex = `0x${chainId.toString(16)}`;
  
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        let params;
        
        // Define chain parameters based on chainId
        switch (chainId) {
          case 1: // Ethereum Mainnet
            // Already should be added to MetaMask
            break;
          case 33139: // Apechain Mainnet
            params = {
              chainId: '0x8173',
              chainName: 'Apechain Mainnet',
              nativeCurrency: {
                name: 'Ape',
                symbol: 'APE',
                decimals: 18
              },
              rpcUrls: ['https://rpc.apechain.com/http'],
              blockExplorerUrls: ['https://apescan.com/']
            };
            break;
        }
        
        if (params) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          });
        }
        
        return true;
      } catch (addError) {
        console.error('Failed to add chain', addError);
        throw new Error('Failed to add chain to MetaMask');
      }
    }
    
    console.error('Failed to switch chain', error);
    throw error;
  }
};

/**
 * Get a human-readable name for a chain ID
 */
export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 33139:
      return 'Apechain Mainnet';
    default:
      return `Chain ID ${chainId}`;
  }
};

/**
 * Format an Ethereum address for display (0x1234...abcd)
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length < 10) return address;
  
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Handle wallet connection with proper error handling
 */
export const connectWallet = async (): Promise<{ address: string; chainId: number }> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
  }
  
  const accounts = await requestAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found. Please check your MetaMask setup.');
  }
  
  const chainId = await getChainId();
  
  return { 
    address: accounts[0],
    chainId
  };
};

/**
 * Create a signature for wallet verification
 */
export const createWalletSignature = async (): Promise<{
  address: string;
  chainId: number;
  message: string;
  signature: string;
  timestamp: number;
}> => {
  const { address, chainId } = await connectWallet();
  
  const timestamp = Date.now();
  const message = `Verify wallet ownership for The Boring Platform: ${timestamp}`;
  
  const signature = await signMessage(message, address);
  
  return {
    address,
    chainId,
    message,
    signature,
    timestamp
  };
};

/**
 * Set up event listeners for wallet changes
 */
export const setupWalletEventListeners = (
  onAccountsChanged?: (accounts: string[]) => void,
  onChainChanged?: (chainId: string) => void,
  onDisconnect?: (error: { code: number; message: string }) => void
): void => {
  const { ethereum } = window as EthereumWindow;
  
  if (!ethereum) {
    console.warn('MetaMask is not installed. Cannot set up event listeners.');
    return;
  }
  
  if (onAccountsChanged) {
    ethereum.on('accountsChanged', onAccountsChanged);
  }
  
  if (onChainChanged) {
    ethereum.on('chainChanged', onChainChanged);
  }
  
  if (onDisconnect) {
    ethereum.on('disconnect', onDisconnect);
  }
};