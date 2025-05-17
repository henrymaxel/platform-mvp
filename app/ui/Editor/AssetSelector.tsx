// app/ui/Editor/AssetSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getUserAssetLimit, getAssetsForProject, addAssetAction, removeAssetAction } from '@/app/lib/actions/projectAssets';
import { getUsableCharacterProfiles } from '@/app/lib/actions/characterProfiles';
import { Plus, X, AlertCircle } from 'lucide-react';
import NftImage from '@/app/ui/NFTImage';

interface Asset {
    id: string;
    name: string;
    image_url: string;
    collection_name: string;
    token_id: string;
}

interface AssetSelectorProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AssetSelector({ projectId, isOpen, onClose }: AssetSelectorProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
    const [assetLimit, setAssetLimit] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
        }
    }, [isOpen, projectId]);

    const fetchAssets = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get asset limit from subscription
            const { maxAssets } = await getUserAssetLimit();
            setAssetLimit(maxAssets);

            // Get usable character profiles
            const profiles = await getUsableCharacterProfiles();

            // Get already selected assets for this project
            const projectAssets = await getAssetsForProject(projectId);

            // Transform profiles to assets
            const availableAssets = profiles.map(profile => ({
                id: profile.asset_id,
                name: profile.character_name,
                image_url: '', // You'd need to fill this from the NFT data
                collection_name: '', // Fill from NFT data
                token_id: '' // Fill from NFT data
            }));

            // Set selected assets
            const selected = projectAssets.map(asset => ({
                id: asset.asset_id,
                name: asset.name,
                image_url: '', // Fill from NFT data
                collection_name: asset.collection_name,
                token_id: asset.nft_token_id
            }));

            setAssets(availableAssets);
            setSelectedAssets(selected);
        } catch (error) {
            console.error('Failed to fetch assets:', error);
            setError('Failed to load available assets');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAsset = async (asset: Asset) => {
        if (selectedAssets.length >= assetLimit) {
            setError(`You can only add up to ${assetLimit} assets to this project with your current subscription`);
            return;
        }

        try {
            await addAssetAction(projectId, asset.id);
            setSelectedAssets(prev => [...prev, asset]);
        } catch (error) {
            console.error('Failed to add asset:', error);
            setError('Failed to add asset to project');
        }
    };

    const handleRemoveAsset = async (assetId: string) => {
        try {
            await removeAssetAction(projectId, assetId);
            setSelectedAssets(prev => prev.filter(a => a.id !== assetId));
        } catch (error) {
            console.error('Failed to remove asset:', error);
            setError('Failed to remove asset from project');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Character Assets</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="bg-myred-500 text-white p-4 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="mb-4 p-4 bg-gray-700 rounded-lg flex items-start">
                    <AlertCircle size={20} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm">
                            Your subscription allows you to add up to <strong>{assetLimit}</strong> character assets per project.
                            Only characters with complete profiles can be added to projects.
                        </p>
                    </div>
                </div>

                {/* Selected Assets */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Selected Characters ({selectedAssets.length}/{assetLimit})</h3>

                    {selectedAssets.length === 0 ? (
                        <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <p className="text-gray-400">No characters selected yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {selectedAssets.map(asset => (
                                <div key={asset.id} className="bg-gray-700 rounded-lg p-2 relative">
                                    <button
                                        onClick={() => handleRemoveAsset(asset.id)}
                                        className="absolute top-1 right-1 p-1 bg-myred-500 rounded-full text-white"
                                        title="Remove"
                                    >
                                        <X size={14} />
                                    </button>

                                    <div className="w-full aspect-square relative mb-2">
                                        <NftImage
                                            imageUrl={asset.image_url}
                                            alt={asset.name}
                                        />
                                    </div>

                                    <div className="text-center">
                                        <p className="font-medium truncate">{asset.name}</p>
                                        <p className="text-xs text-gray-400">{asset.collection_name} #{asset.token_id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Available Assets */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Available Characters</h3>

                    {isLoading ? (
                        <div className="bg-gray-700 rounded-lg p-6 text-center">
                            <div className="animate-spin h-8 w-8 border-2 border-myred-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p>Loading available characters...</p>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="bg-gray-700 rounded-lg p-6 text-center">
                            <p className="text-gray-400 mb-4">No characters available</p>
                            <button
                                onClick={() => window.location.href = '/dashboard/settings/assets'}
                                className="px-4 py-2 bg-myred-500 rounded-lg hover:bg-myred-600"
                            >
                                Create Character Profiles
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {assets
                                .filter(asset => !selectedAssets.some(selected => selected.id === asset.id))
                                .map(asset => (
                                    <div
                                        key={asset.id}
                                        className="bg-gray-700 rounded-lg p-2 cursor-pointer hover:bg-gray-600 transition-colors"
                                        onClick={() => handleAddAsset(asset)}
                                    >
                                        <div className="w-full aspect-square relative mb-2">
                                            <NftImage
                                                imageUrl={asset.image_url}
                                                alt={asset.name}
                                            />
                                        </div>

                                        <div className="text-center">
                                            <p className="font-medium truncate">{asset.name}</p>
                                            <p className="text-xs text-gray-400">{asset.collection_name} #{asset.token_id}</p>

                                            <button
                                                className="mt-2 px-2 py-1 bg-myred-500 rounded text-sm hover:bg-myred-600 flex items-center justify-center mx-auto"
                                                disabled={selectedAssets.length >= assetLimit}
                                            >
                                                <Plus size={14} className="mr-1" />
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}