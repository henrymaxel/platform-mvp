'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, Search, Plus, Edit, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { getUserNfts, refreshNftOwnership, deleteUserNft } from '@/app/lib/actions/nfts';
import LoadingDashboard from '../../loading';

interface NFTAsset {
    id: string;
    collection_id: string;
    collection_name: string;
    token_id: string;
    token_metadata: any;
    wallet_address: string;
    chain_id: number;
    last_verified_at: string;
    has_character_profile: boolean;
    image_url?: string;
    name?: string;
}

export default function AssetsManagementPage() {
    const [nfts, setNfts] = useState<NFTAsset[]>([]);
    const [filteredNfts, setFilteredNfts] = useState<NFTAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [nftToDelete, setNftToDelete] = useState<NFTAsset | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshingNftId, setRefreshingNftId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();
    const { data: session, status } = useSession();

    // Load NFT assets on page load
    useEffect(() => {
        if (status === 'authenticated') {
            fetchNftAssets();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Update filtered NFTs when search query or filter changes
    useEffect(() => {
        if (!nfts.length) {
            setFilteredNfts([]);
            return;
        }

        let filtered = [...nfts];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(nft =>
                (nft.name?.toLowerCase().includes(query)) ||
                nft.collection_name.toLowerCase().includes(query) ||
                nft.token_id.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (activeFilter === 'with-profile') {
            filtered = filtered.filter(nft => nft.has_character_profile);
        } else if (activeFilter === 'without-profile') {
            filtered = filtered.filter(nft => !nft.has_character_profile);
        }

        setFilteredNfts(filtered);
    }, [nfts, searchQuery, activeFilter]);

    // Fetch NFT assets from the database
    const fetchNftAssets = async () => {
        try {
            setLoading(true);
            const data = await getUserNfts();

            // Process the NFT data
            const processedNfts = data.map((nft: any) => {
                // Extract name and image URL from token_metadata
                const metadata = nft.token_metadata || {};
                const name = metadata.name || `NFT #${nft.token_id}`;
                const imageUrl = metadata.image || metadata.image_url || '/placeholder-nft.png';

                return {
                    ...nft,
                    name,
                    image_url: imageUrl
                };
            });

            setNfts(processedNfts);
        } catch (error) {
            console.error('Failed to fetch NFT assets:', error);
            setError('Failed to load NFT assets');
        } finally {
            setLoading(false);
        }
    };

    // Refresh NFT ownership verification
    const handleRefreshOwnership = async (nftId: string) => {
        try {
            setRefreshingNftId(nftId);
            setIsRefreshing(true);
            setError(null);
            setSuccess(null);

            await refreshNftOwnership(nftId);
            await fetchNftAssets(); // Refresh the NFT list

            setSuccess('NFT ownership verified successfully');
        } catch (error) {
            console.error('Failed to verify NFT ownership:', error);
            setError(error instanceof Error ? error.message : 'Failed to verify NFT ownership');
        } finally {
            setIsRefreshing(false);
            setRefreshingNftId(null);
        }
    };

    // Handle NFT deletion
    const handleDeleteNft = async () => {
        if (!nftToDelete) return;

        try {
            setIsDeleting(true);
            await deleteUserNft(nftToDelete.id);
            setSuccess('NFT removed successfully');
            setShowDeleteModal(false);
            setNftToDelete(null);

            // Update local state
            setNfts(prevNfts => prevNfts.filter(nft => nft.id !== nftToDelete.id));
        } catch (error) {
            console.error('Failed to remove NFT:', error);
            setError('Failed to remove NFT');
        } finally {
            setIsDeleting(false);
        }
    };

    // Format time ago for last verified timestamp
    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const getChainName = (chainId: number) => {
        switch (chainId) {
            case 1:
                return 'Ethereum';
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
                return `Chain ${chainId}`;
        }
    };

    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    // Show loading state
    if (status === 'loading' || loading) {
        return <LoadingDashboard />;
    }

    return (
        <div className="p-4 md:p-6 h-full overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/dashboard/settings" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold">NFT Assets</h1>
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

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === 'all'
                                ? 'bg-myred-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            All NFTs
                        </button>
                        <button
                            onClick={() => setActiveFilter('with-profile')}
                            className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === 'with-profile'
                                ? 'bg-myred-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            With Profiles
                        </button>
                        <button
                            onClick={() => setActiveFilter('without-profile')}
                            className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === 'without-profile'
                                ? 'bg-myred-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            No Profile
                        </button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search NFTs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 py-2 bg-gray-700 border border-gray-600 rounded focus:ring-myred-500 focus:outline-none text-sm"
                        />
                    </div>
                </div>

                {/* No NFTs State */}
                {nfts.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No NFTs Found</h2>
                        <p className="text-gray-400 mb-6">
                            You don't have any verified NFTs yet. Connect your wallet to verify your NFT ownership.
                        </p>
                        <Link
                            href="/dashboard/settings/wallet/connect"
                            className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded inline-flex items-center"
                        >
                            <Plus size={16} className="mr-2" />
                            Connect Wallet
                        </Link>
                    </div>
                ) : filteredNfts.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <h2 className="text-xl font-semibold mb-2">No Matching NFTs</h2>
                        <p className="text-gray-400 mb-4">
                            No NFTs match your current search or filter criteria.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setActiveFilter('all');
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNfts.map((nft) => (
                            <div key={nft.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                {/* NFT Image */}
                                <div className="relative h-48 bg-gray-700">
                                    <Image
                                        src={nft.image_url || '/placeholder-nft.png'}
                                        alt={nft.name || `NFT #${nft.token_id}`}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>

                                {/* NFT Details */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-lg truncate" title={nft.name}>
                                                {nft.name || `NFT #${nft.token_id}`}
                                            </h3>
                                            <p className="text-sm text-gray-400">{nft.collection_name}</p>
                                        </div>
                                        <div className="flex">
                                            <button
                                                onClick={() => handleRefreshOwnership(nft.id)}
                                                disabled={isRefreshing && refreshingNftId === nft.id}
                                                className="p-2 hover:bg-gray-700 rounded mr-1"
                                                title="Verify Ownership"
                                            >
                                                <RefreshCw
                                                    size={16}
                                                    className={`text-gray-400 ${isRefreshing && refreshingNftId === nft.id ? 'animate-spin' : ''}`}
                                                />
                                            </button>

                                            <a
                                                href={`https://opensea.io/assets/ethereum/${nft.collection_id}/${nft.token_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-gray-700 rounded"
                                                title="View on OpenSea"
                                            >
                                                <ExternalLink size={16} className="text-gray-400" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center mt-2 text-xs text-gray-400">
                                        <div className="flex items-center">
                                            <span className="mr-2">{getChainName(nft.chain_id)}</span>
                                            <span title={nft.wallet_address}>{formatAddress(nft.wallet_address)}</span>
                                        </div>
                                        <span className="mx-2">•</span>
                                        <span title={new Date(nft.last_verified_at).toLocaleString()}>
                                            Verified {formatTimeAgo(nft.last_verified_at)}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex justify-between items-center">
                                        {nft.has_character_profile ? (
                                            <Link
                                                href={`/dashboard/assets/profile/${nft.id}`}
                                                className="px-3 py-1.5 bg-myred-600 hover:bg-myred-700 rounded flex items-center text-sm"
                                            >
                                                <Edit size={14} className="mr-2" />
                                                Edit Profile
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/dashboard/assets/profile/${nft.id}`}
                                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded flex items-center text-sm"
                                            >
                                                <Plus size={14} className="mr-2" />
                                                Create Profile
                                            </Link>
                                        )}

                                        <button
                                            onClick={() => {
                                                setNftToDelete(nft);
                                                setShowDeleteModal(true);
                                            }}
                                            className="px-3 py-1.5 text-myred-400 hover:text-white border border-myred-400 hover:bg-myred-600 hover:border-transparent rounded text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && nftToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Remove NFT</h2>
                        <p className="mb-6">
                            Are you sure you want to remove <span className="font-semibold">{nftToDelete.name || `NFT #${nftToDelete.token_id}`}</span> from your assets?
                            This will remove any character profiles associated with this NFT.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setNftToDelete(null);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteNft}
                                className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Removing...
                                    </>
                                ) : (
                                    'Remove'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}