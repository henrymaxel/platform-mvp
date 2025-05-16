'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, AlertCircle, Check, Tag, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
    getAvailableCharactersForProject,
    addCharacterToProject,
    removeCharacterFromProject
} from '@/app/lib/actions/nfts';

interface Character {
    id: string;
    asset_id: string;
    character_name: string;
    character_description: string;
    is_protagonist: boolean;
    is_antagonist: boolean;
    is_supporting: boolean;
    image_url: string;
    collection_name: string;
}

interface ProjectCharactersProps {
    projectId: string;
}

export default function ProjectCharacters({ projectId }: ProjectCharactersProps) {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [assignedCharacterIds, setAssignedCharacterIds] = useState<string[]>([]);
    const [maxAllowed, setMaxAllowed] = useState(1);
    const [canAddMore, setCanAddMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    // Fetch available characters on mount
    useEffect(() => {
        fetchAvailableCharacters();
    }, [projectId]);

    // Filter characters based on search query
    const filteredCharacters = characters.filter(character =>
        character.character_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.collection_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get currently assigned characters
    const assignedCharacters = characters.filter(character =>
        assignedCharacterIds.includes(character.asset_id)
    );

    // Fetch available characters for the project
    const fetchAvailableCharacters = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getAvailableCharactersForProject(projectId);

            setCharacters(data.characters);
            setAssignedCharacterIds(data.assigned);
            setMaxAllowed(data.maxAllowed);
            setCanAddMore(data.canAddMore);
        } catch (error) {
            console.error('Failed to fetch available characters:', error);
            setError('Failed to load characters');
        } finally {
            setLoading(false);
        }
    };

    // Handle adding a character to the project
    const handleAddCharacter = async (assetId: string) => {
        try {
            setIsAdding(true);
            setError(null);

            await addCharacterToProject(projectId, assetId);

            // Update local state
            setAssignedCharacterIds(prev => [...prev, assetId]);
            setCanAddMore(assignedCharacterIds.length + 1 < maxAllowed);

            // Close the modal
            setShowAddModal(false);
        } catch (error) {
            console.error('Failed to add character:', error);
            setError(error instanceof Error ? error.message : 'Failed to add character');
        } finally {
            setIsAdding(false);
        }
    };

    // Handle removing a character from the project
    const handleRemoveCharacter = async (assetId: string) => {
        try {
            setIsRemoving(assetId);
            setError(null);

            await removeCharacterFromProject(projectId, assetId);

            // Update local state
            setAssignedCharacterIds(prev => prev.filter(id => id !== assetId));
            setCanAddMore(true);
        } catch (error) {
            console.error('Failed to remove character:', error);
            setError(error instanceof Error ? error.message : 'Failed to remove character');
        } finally {
            setIsRemoving(null);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Characters</h2>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-24 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Characters</h2>

            {error && (
                <div className="bg-myred-500 text-white p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">
                    <Tag size={16} className="inline mr-2" />
                    <span>{assignedCharacterIds.length} of {maxAllowed} characters used</span>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    disabled={!canAddMore}
                    className={`px-3 py-1.5 rounded text-sm flex items-center ${canAddMore
                            ? 'bg-myred-600 hover:bg-myred-700'
                            : 'bg-gray-700 cursor-not-allowed opacity-50'
                        }`}
                >
                    <Plus size={16} className="mr-1" />
                    Add Character
                </button>
            </div>

            {assignedCharacterIds.length === 0 ? (
                <div className="border border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={20} className="text-gray-400" />
                    </div>
                    <h3 className="font-medium mb-1">No Characters Added</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Add NFT characters to use in your story
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        disabled={!canAddMore}
                        className={`px-3 py-1.5 rounded text-sm inline-flex items-center ${canAddMore
                                ? 'bg-myred-600 hover:bg-myred-700'
                                : 'bg-gray-700 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Plus size={16} className="mr-1" />
                        Add Character
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignedCharacters.map(character => (
                        <div key={character.asset_id} className="bg-gray-700 rounded-lg p-3 flex">
                            <div className="h-16 w-16 bg-gray-600 rounded overflow-hidden flex-shrink-0">
                                <Image
                                    src={character.image_url}
                                    alt={character.character_name}
                                    width={64}
                                    height={64}
                                    unoptimized
                                    className="object-cover w-full h-full"
                                />
                            </div>

                            <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-medium">{character.character_name}</h3>
                                    <button
                                        onClick={() => handleRemoveCharacter(character.asset_id)}
                                        disabled={isRemoving === character.asset_id}
                                        className="text-gray-400 hover:text-myred-500 p-1"
                                    >
                                        {isRemoving === character.asset_id ? (
                                            <div className="animate-spin h-4 w-4 border-2 border-myred-500 border-t-transparent rounded-full"></div>
                                        ) : (
                                            <X size={16} />
                                        )}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-400 mt-1">{character.collection_name}</p>

                                <div className="flex mt-2">
                                    {character.is_protagonist && (
                                        <span className="text-xs bg-green-600 bg-opacity-20 text-green-400 px-2 py-0.5 rounded-full mr-2">
                                            Protagonist
                                        </span>
                                    )}
                                    {character.is_antagonist && (
                                        <span className="text-xs bg-myred-600 bg-opacity-20 text-myred-400 px-2 py-0.5 rounded-full mr-2">
                                            Antagonist
                                        </span>
                                    )}
                                    {character.is_supporting && (
                                        <span className="text-xs bg-blue-600 bg-opacity-20 text-blue-400 px-2 py-0.5 rounded-full mr-2">
                                            Supporting
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {assignedCharacterIds.length > 0 && assignedCharacterIds.length < maxAllowed && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-3 py-1.5 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-500 w-full"
                    >
                        <Plus size={16} className="inline mr-1" />
                        Add Another Character
                    </button>
                </div>
            )}

            {/* Info about subscription limits */}
            {assignedCharacterIds.length >= maxAllowed && (
                <div className="mt-4 bg-gray-700 p-3 rounded-lg text-sm flex items-start">
                    <Info size={16} className="text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                        <p className="text-gray-300">
                            You've reached the maximum number of characters for your subscription tier.
                        </p>
                        <Link href="/dashboard/settings/subscriptions" className="text-myred-500 hover:text-myred-400">
                            Upgrade your subscription to add more characters →
                        </Link>
                    </div>
                </div>
            )}

            {/* Add Character Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add Character</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 hover:bg-gray-700 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search characters..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-myred-500 focus:outline-none"
                            />
                        </div>

                        {/* Character List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredCharacters.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 mb-2">No matching characters found</p>
                                    <Link href="/dashboard/assets" className="text-myred-500 hover:underline">
                                        Create new character profiles
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredCharacters.map(character => {
                                        const isAssigned = assignedCharacterIds.includes(character.asset_id);

                                        return (
                                            <div
                                                key={character.asset_id}
                                                className={`bg-gray-700 rounded-lg p-4 flex ${isAssigned ? 'ring-2 ring-myred-500' : ''}`}
                                            >
                                                <div className="h-16 w-16 bg-gray-600 rounded overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={character.image_url}
                                                        alt={character.character_name}
                                                        width={64}
                                                        height={64}
                                                        unoptimized
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>

                                                <div className="ml-3 flex-1">
                                                    <h4 className="font-medium">{character.character_name}</h4>
                                                    <p className="text-xs text-gray-400 mb-2">{character.collection_name}</p>

                                                    <div className="flex flex-wrap gap-1">
                                                        {character.is_protagonist && (
                                                            <span className="text-xs bg-green-600 bg-opacity-20 text-green-400 px-2 py-0.5 rounded-full">
                                                                Protagonist
                                                            </span>
                                                        )}
                                                        {character.is_antagonist && (
                                                            <span className="text-xs bg-myred-600 bg-opacity-20 text-myred-400 px-2 py-0.5 rounded-full">
                                                                Antagonist
                                                            </span>
                                                        )}
                                                        {character.is_supporting && (
                                                            <span className="text-xs bg-blue-600 bg-opacity-20 text-blue-400 px-2 py-0.5 rounded-full">
                                                                Supporting
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="ml-2 flex items-center">
                                                    {isAssigned ? (
                                                        <button
                                                            onClick={() => handleRemoveCharacter(character.asset_id)}
                                                            disabled={isRemoving === character.asset_id}
                                                            className="p-2 bg-myred-600 text-white rounded-full"
                                                        >
                                                            {isRemoving === character.asset_id ? (
                                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                            ) : (
                                                                <Check size={16} />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddCharacter(character.asset_id)}
                                                            disabled={isAdding || (!canAddMore && !isAssigned)}
                                                            className={`p-2 rounded-full ${canAddMore
                                                                    ? 'bg-gray-600 hover:bg-myred-600 text-white'
                                                                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                                                                }`}
                                                        >
                                                            {isAdding ? (
                                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                            ) : (
                                                                <Plus size={16} />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between">
                            <Link
                                href="/dashboard/assets"
                                target="_blank"
                                className="text-myred-500 hover:text-myred-400 text-sm"
                            >
                                Manage NFT Characters
                            </Link>

                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}