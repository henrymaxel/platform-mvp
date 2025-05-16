'use client';

import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, ChevronDown, BookOpen, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectCharacters } from '@/app/lib/actions/nfts';

interface Character {
    id: string;
    asset_id: string;
    character_name: string;
    character_description: string;
    is_protagonist: boolean;
    is_antagonist: boolean;
    is_supporting: boolean;
    backstory: string;
    role_in_story: string;
    visual_appearance: string;
    image_url: string;
    collection_name: string;
}

interface StudioCharactersPanelProps {
    projectId: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function StudioCharactersPanel({
    projectId,
    isCollapsed,
    onToggleCollapse
}: StudioCharactersPanelProps) {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [expandedCharacters, setExpandedCharacters] = useState<string[]>([]);

    // Fetch project characters on mount
    useEffect(() => {
        if (projectId) {
            fetchProjectCharacters();
        }
    }, [projectId]);

    // Fetch project characters
    const fetchProjectCharacters = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getProjectCharacters(projectId);

            setCharacters(data);

            // Auto-select the first character if there is one
            if (data.length > 0) {
                setSelectedCharacter(data[0]);
                setExpandedCharacters([data[0].asset_id]);
            }
        } catch (error) {
            console.error('Failed to fetch project characters:', error);
            setError('Failed to load characters');
        } finally {
            setLoading(false);
        }
    };

    // Toggle character expansion
    const toggleCharacterExpanded = (assetId: string) => {
        setExpandedCharacters(prev => {
            if (prev.includes(assetId)) {
                return prev.filter(id => id !== assetId);
            } else {
                return [...prev, assetId];
            }
        });
    };

    // Helper to check if a character is expanded
    const isCharacterExpanded = (assetId: string) => {
        return expandedCharacters.includes(assetId);
    };

    if (isCollapsed) {
        return (
            <div className="w-12 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300">
                <div className="p-3 border-b border-gray-700 flex justify-center">
                    <button
                        onClick={onToggleCollapse}
                        className="p-1 hover:bg-gray-700 rounded"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-4">
                    <div className="p-2 bg-myred-600 rounded-full mb-2">
                        <Users size={18} className="text-white" />
                    </div>
                    <div className="w-px h-16 bg-gray-700"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold">Characters</h2>
                <button
                    onClick={onToggleCollapse}
                    className="p-1 hover:bg-gray-700 rounded"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 p-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-12 bg-gray-700 rounded"></div>
                        <div className="h-12 bg-gray-700 rounded"></div>
                    </div>
                </div>
            ) : error ? (
                <div className="flex-1 p-4">
                    <div className="text-myred-500">{error}</div>
                </div>
            ) : characters.length === 0 ? (
                <div className="flex-1 p-4">
                    <div className="bg-gray-700 p-4 rounded text-center">
                        <Users size={24} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-300 mb-2">No Characters Added</p>
                        <p className="text-sm text-gray-400 mb-3">
                            Add NFT characters to enhance your story
                        </p>
                        <Link
                            href={`/dashboard/assets`}
                            className="text-sm text-myred-500 hover:text-myred-400"
                        >
                            Manage NFT Characters →
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-3">
                        {characters.map(character => (
                            <div key={character.asset_id} className="bg-gray-700 rounded-lg overflow-hidden">
                                <div
                                    className={`p-3 flex items-center cursor-pointer ${selectedCharacter?.asset_id === character.asset_id
                                            ? 'bg-myred-600 text-white'
                                            : 'hover:bg-gray-600'
                                        }`}
                                    onClick={() => setSelectedCharacter(character)}
                                >
                                    <div className="h-8 w-8 bg-gray-600 rounded overflow-hidden mr-3">
                                        <Image
                                            src={character.image_url}
                                            alt={character.character_name}
                                            width={32}
                                            height={32}
                                            unoptimized
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{character.character_name}</h3>
                                        <div className="flex items-center text-xs">
                                            {character.is_protagonist && (
                                                <span className="mr-2 text-green-400">Protagonist</span>
                                            )}
                                            {character.is_antagonist && (
                                                <span className="mr-2 text-myred-400">Antagonist</span>
                                            )}
                                            {character.is_supporting && (
                                                <span className="mr-2 text-blue-400">Supporting</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCharacterExpanded(character.asset_id);
                                        }}
                                        className="p-1 hover:bg-gray-500 rounded"
                                    >
                                        {isCharacterExpanded(character.asset_id) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </button>
                                </div>

                                {isCharacterExpanded(character.asset_id) && (
                                    <div className="p-3 border-t border-gray-600 text-sm">
                                        {character.character_description && (
                                            <p className="text-gray-300 mb-2">{character.character_description}</p>
                                        )}

                                        <div className="space-y-2">
                                            {character.backstory && (
                                                <div>
                                                    <h4 className="font-medium text-xs uppercase text-gray-400">Backstory</h4>
                                                    <p className="text-gray-300">{character.backstory}</p>
                                                </div>
                                            )}

                                            {character.role_in_story && (
                                                <div>
                                                    <h4 className="font-medium text-xs uppercase text-gray-400">Role</h4>
                                                    <p className="text-gray-300">{character.role_in_story}</p>
                                                </div>
                                            )}

                                            {character.visual_appearance && (
                                                <div>
                                                    <h4 className="font-medium text-xs uppercase text-gray-400">Appearance</h4>
                                                    <p className="text-gray-300">{character.visual_appearance}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 flex justify-between">
                                            <Link
                                                href={`/dashboard/assets/profile/${character.id}`}
                                                target="_blank"
                                                className="text-myred-500 hover:text-myred-400 text-xs"
                                            >
                                                Edit Character
                                            </Link>
                                            <span className="text-gray-400 text-xs">{character.collection_name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-3 border-t border-gray-700">
                <Link
                    href="/dashboard/assets"
                    className="text-sm text-center block w-full p-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                    Manage Characters
                </Link>
            </div>
        </div>
    );
}

// ChevronLeft component
function ChevronLeft(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}