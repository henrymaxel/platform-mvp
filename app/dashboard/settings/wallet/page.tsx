'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, LinkIcon, Check, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { connectWallet, getConnectedWallets, disconnectWallet } from '@/app/lib/actions/wallet';
import LoadingDashboard from '../../loading';
import {
    isMetaMaskInstalled,
    createWalletSignature
} from '@/app/lib/ethereum';

// Define the necessary interfaces
interface ConnectedWallet {
    id: string;
    wallet_address: string;
    chain_id: number;
    wallet_type: string;
    is_primary: boolean;
    created_at: string;
}

export default function ConnectWalletPage() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [wallets, setWallets] = useState<ConnectedWallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [walletToDisconnect, setWalletToDisconnect] = useState<ConnectedWallet | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    // Load connected wallets on page load
    useEffect(() => {
        if (status === 'authenticated') {
            fetchConnectedWallets();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Fetch connected wallets from the database
    const fetchConnectedWallets = async () => {
        try {
            setLoading(true);
            const data = await getConnectedWallets();
            setWallets(data);
        } catch (error) {
            console.error('Failed to fetch connected wallets:', error);
            setError('Failed to load connected wallets');
        } finally {
            setLoading(false);
        }
    };

    // Handle wallet connection
    const handleConnectWallet = async () => {
        try {
            setIsConnecting(true);
            setError(null);
            setSuccess(null);

            // Check if MetaMask is installed
            if (!isMetaMaskInstalled()) {
                setError('MetaMask is not installed. Please install MetaMask to connect your wallet.');
                return;
            }

            // Use the helper function to create a wallet signature
            const { address, chainId, message, signature, timestamp } = await createWalletSignature();

            // Send to server for verification and storage
            const result = await connectWallet({
                address,
                chainId,
                walletType: 'metamask',
                message,
                signature,
                timestamp
            });

            setSuccess('Wallet connected successfully!');
            fetchConnectedWallets(); // Refresh the wallet list

        } catch (error) {
            console.error('Failed to connect wallet:', error);
            setError(error instanceof Error ? error.message : 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    };

    // Handle wallet disconnection
    const handleDisconnectWallet = async () => {
        if (!walletToDisconnect) return;

        try {
            setIsDisconnecting(true);
            await disconnectWallet(walletToDisconnect.id);
            setSuccess('Wallet disconnected successfully');
            setShowDisconnectModal(false);
            setWalletToDisconnect(null);
            fetchConnectedWallets(); // Refresh wallet list
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            setError('Failed to disconnect wallet');
        } finally {
            setIsDisconnecting(false);
        }
    };

    // Format chain name based on chain ID
    const getChainName = (chainId: number) => {
        switch (chainId) {
            case 1:
                return 'Ethereum Mainnet';
            case 137:
                return 'Polygon';
            case 10:
                return 'Optimism';
            case 42161:
                return 'Arbitrum';
            case 43114:
                return 'Avalanche';
            case 56:
                return 'BNB Chain';
            case 8453:
                return 'Base';
            default:
                return `Chain ID ${chainId}`;
        }
    };

    // Format wallet address for display
    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    if (status === 'loading' || loading) {
        return <LoadingDashboard />;
    }

    return (
        <div className="p-4 md:p-6 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/dashboard/settings" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold">Connect Wallet</h1>
                </div>

                {error && (
                    <div className="bg-myred-500 text-white p-4 rounded mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-600 text-white p-4 rounded mb-6">
                        {success}
                    </div>
                )}

                {/* Connected Wallets */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4">Connected Wallets</h2>

                    {wallets.length === 0 ? (
                        <div className="text-center text-gray-400 py-6">
                            <LinkIcon size={40} className="mx-auto mb-4 opacity-50" />
                            <p className="mb-2">No wallets connected yet</p>
                            <p className="text-sm">Connect your Ethereum wallet to verify ownership of your NFTs</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {wallets.map((wallet) => (
                                <div key={wallet.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center">
                                            <span className="font-medium">{formatAddress(wallet.wallet_address)}</span>
                                            {wallet.is_primary && (
                                                <span className="ml-2 px-2 py-0.5 bg-myred-500 text-white text-xs rounded-full">Primary</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{getChainName(wallet.chain_id)}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <a
                                            href={`https://etherscan.io/address/${wallet.wallet_address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-gray-600 rounded"
                                            title="View on Etherscan"
                                        >
                                            <ExternalLink size={18} className="text-gray-400" />
                                        </a>
                                        <button
                                            onClick={() => {
                                                setWalletToDisconnect(wallet);
                                                setShowDisconnectModal(true);
                                            }}
                                            className="text-sm px-3 py-1 text-myred-400 hover:text-white hover:bg-myred-600 border border-myred-400 hover:border-transparent rounded"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={handleConnectWallet}
                            disabled={isConnecting}
                            className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center"
                        >
                            {isConnecting ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Plus size={16} className="mr-2" />
                                    Connect Wallet
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Information Card */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                        <AlertCircle size={20} className="text-myred-500 mr-2" />
                        <h3 className="text-lg font-semibold">Why Connect Your Wallet?</h3>
                    </div>

                    <p className="text-gray-300 mb-4">
                        Connecting your Ethereum wallet allows us to verify ownership of your NFTs. This enables you to use your NFTs as characters in your stories.
                    </p>

                    <ul className="space-y-2 text-gray-300 ml-6 list-disc">
                        <li>Verify and showcase your NFT collections</li>
                        <li>Create character profiles for your NFTs</li>
                        <li>Use your NFTs as characters in your stories</li>
                        <li>Gain access to exclusive features for NFT holders</li>
                    </ul>

                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                            Don't have a wallet? We recommend using{" "}
                            <a
                                href="https://metamask.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-myred-500 hover:underline"
                            >
                                MetaMask
                            </a>
                            {" "}to get started.
                        </p>
                    </div>
                </div>
            </div>

            {/* Disconnect Confirmation Modal */}
            {showDisconnectModal && walletToDisconnect && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Disconnect Wallet</h2>
                        <p className="mb-6">
                            Are you sure you want to disconnect the wallet {formatAddress(walletToDisconnect.wallet_address)}? This will remove any NFTs associated with this wallet from your account.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDisconnectModal(false);
                                    setWalletToDisconnect(null);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                                disabled={isDisconnecting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDisconnectWallet}
                                className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center"
                                disabled={isDisconnecting}
                            >
                                {isDisconnecting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Disconnecting...
                                    </>
                                ) : (
                                    'Disconnect'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add TypeScript definitions for ethereum window object
declare global {
    interface Window {
        ethereum: {
            isMetaMask?: boolean;
            request: (request: { method: string; params?: any[] }) => Promise<any>;
            on: (eventName: string, callback: (...args: any[]) => void) => void;
        };
    }
}