'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Edit, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { getUserNFTs, updateNFTCharacter } from '@/app/lib/actions/assets';
import LoadingDashboard from '../../loading';

// Define types locally for client component 
interface NFTCharacter {
    id: string;
    collection_name: string;
    token_id: string;
    character_name: string;
    character_bio: string;
    image_url: string;
    wallet_address: string;
}

export default function AssetsPage() {
    const [nfts, setNfts] = useState<NFTCharacter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingNFT, setEditingNFT] = useState<string | null>(null);
    const [editData, setEditData] = useState({
        character_name: '',
        character_bio: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            fetchNFTs();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const fetchNFTs = async () => {
        try {
            setLoading(true);
            const data = await getUserNFTs();
            setNfts(data as NFTCharacter[]);
        } catch (error) {
            console.error('Failed to fetch NFTs:', error);
            setError('Failed to load NFTs');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (nft: NFTCharacter) => {
        setEditingNFT(nft.id);
        setEditData({
            character_name: nft.character_name || '',
            character_bio: nft.character_bio || ''
        });
    };

    const handleCancel = () => {
        setEditingNFT(null);
        setEditData({
            character_name: '',
            character_bio: ''
        });
    };

    const handleSave = async (nftId: string) => {
        try {
            setIsSaving(true);
            setSuccess(null);
            setError(null);

            await updateNFTCharacter(nftId, editData);

            setSuccess('Character updated successfully');
            setEditingNFT(null);

            // Refresh NFTs
            fetchNFTs();
        } catch (error) {
            console.error('Failed to update character:', error);
            setError('Failed to update character');
        } finally {
            setIsSaving(false);
        }
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
                    <h1 className="text-2xl font-bold">NFT Characters</h1>
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

                {nfts.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={24} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No NFT Characters Found</h2>
                        <p className="text-gray-400 mb-6">
                            Connect your wallet to import your NFT characters.
                        </p>
                        <Link
                            href="/dashboard/settings/wallet"
                            className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded"
                        >
                            Connect Wallet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {nfts.map((nft) => (
                            <div key={nft.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                <div className="relative">
                                    <div className="aspect-square w-full h-64 md:h-80 bg-gray-700 relative">
                                        {nft.image_url ? (
                                            <Image
                                                src={nft.image_url}
                                                alt={nft.character_name || `${nft.collection_name} #${nft.token_id}`}
                                                fill
                                                objectFit="cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <User size={64} className="text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 px-3 py-1 rounded-full text-sm">
                                        #{nft.token_id}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {editingNFT === nft.id ? (
                                                    <input
                                                        type="text"
                                                        value={editData.character_name}
                                                        onChange={(e) => setEditData({ ...editData, character_name: e.target.value })}
                                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                                        placeholder="Character Name"
                                                    />
                                                ) : (
                                                    nft.character_name || `${nft.collection_name} #${nft.token_id}`
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-400">{nft.collection_name}</p>
                                        </div>

                                        {editingNFT !== nft.id ? (
                                            <button
                                                onClick={() => handleEdit(nft)}
                                                className="p-2 hover:bg-gray-700 rounded"
                                                title="Edit Character"
                                            >
                                                <Edit size={18} className="text-gray-400" />
                                            </button>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSave(nft.id)}
                                                    disabled={isSaving}
                                                    className="px-3 py-1 bg-myred-600 hover:bg-myred-700 rounded text-sm flex items-center"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save size={14} className="mr-1" />
                                                            Save
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium mb-2">Character Bio</h4>
                                        {editingNFT === nft.id ? (
                                            <textarea
                                                value={editData.character_bio}
                                                onChange={(e) => setEditData({ ...editData, character_bio: e.target.value })}
                                                rows={4}
                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                                placeholder="Write a bio for your character..."
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-300">
                                                {nft.character_bio || "No bio available. Click edit to add one."}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="text-xs font-medium text-gray-400">Wallet</h4>
                                                <p className="text-sm truncate max-w-xs">
                                                    {`${nft.wallet_address.substring(0, 6)}...${nft.wallet_address.substring(nft.wallet_address.length - 4)}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}