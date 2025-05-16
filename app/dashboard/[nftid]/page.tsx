'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { getNftDetails, saveCharacterProfile } from '@/app/lib/actions/nfts';
import LoadingDashboard from '../loading';

interface NFTDetails {
    id: string;
    collection_name: string;
    token_id: string;
    token_metadata: any;
    image_url?: string;
    name?: string;
    character_profile?: {
        id?: string;
        character_name: string;
        character_description: string;
        personality_traits: string[];
        backstory: string;
        role_in_story: string;
        visual_appearance: string;
        is_protagonist: boolean;
        is_antagonist: boolean;
        is_supporting: boolean;
    };
}

export default function CharacterProfilePage() {
    const [nft, setNft] = useState<NFTDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        character_name: '',
        character_description: '',
        personality_traits: [] as string[],
        backstory: '',
        role_in_story: '',
        visual_appearance: '',
        is_protagonist: false,
        is_antagonist: false,
        is_supporting: true
    });

    const [traitInput, setTraitInput] = useState('');

    const router = useRouter();
    const { nftId } = useParams();
    const { data: session, status } = useSession();

    // Load NFT details on page load
    useEffect(() => {
        if (status === 'authenticated' && nftId) {
            fetchNftDetails(nftId as string);
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router, nftId]);

    // Fetch NFT details from the database
    const fetchNftDetails = async (id: string) => {
        try {
            setLoading(true);
            const data = await getNftDetails(id);

            // Process the NFT data
            const metadata = data.token_metadata || {};
            const name = metadata.name || `NFT #${data.token_id}`;
            const imageUrl = metadata.image || metadata.image_url || '/placeholder-nft.png';

            const processedNft = {
                ...data,
                name,
                image_url: imageUrl
            };

            setNft(processedNft);

            // Initialize form data with existing profile data if available
            if (processedNft.character_profile) {
                setFormData({
                    character_name: processedNft.character_profile.character_name || '',
                    character_description: processedNft.character_profile.character_description || '',
                    personality_traits: processedNft.character_profile.personality_traits || [],
                    backstory: processedNft.character_profile.backstory || '',
                    role_in_story: processedNft.character_profile.role_in_story || '',
                    visual_appearance: processedNft.character_profile.visual_appearance || '',
                    is_protagonist: processedNft.character_profile.is_protagonist || false,
                    is_antagonist: processedNft.character_profile.is_antagonist || false,
                    is_supporting: processedNft.character_profile.is_supporting || true
                });
            }
        } catch (error) {
            console.error('Failed to fetch NFT details:', error);
            setError('Failed to load NFT details');
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle checkbox changes
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Handle adding a personality trait
    const handleAddTrait = () => {
        if (traitInput.trim() && !formData.personality_traits.includes(traitInput.trim())) {
            setFormData(prev => ({
                ...prev,
                personality_traits: [...prev.personality_traits, traitInput.trim()]
            }));
            setTraitInput('');
        }
    };

    // Handle removing a personality trait
    const handleRemoveTrait = (trait: string) => {
        setFormData(prev => ({
            ...prev,
            personality_traits: prev.personality_traits.filter(t => t !== trait)
        }));
    };

    // Handle trait input keydown
    const handleTraitInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTrait();
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nft) return;

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            // Validate required fields
            if (!formData.character_name.trim()) {
                setError('Character name is required');
                setSaving(false);
                return;
            }

            // Prepare form data
            const profileData = {
                nftId: nft.id,
                character_name: formData.character_name,
                character_description: formData.character_description,
                personality_traits: formData.personality_traits,
                backstory: formData.backstory,
                role_in_story: formData.role_in_story,
                visual_appearance: formData.visual_appearance,
                is_protagonist: formData.is_protagonist,
                is_antagonist: formData.is_antagonist,
                is_supporting: formData.is_supporting
            };

            // Save character profile
            await saveCharacterProfile(profileData);

            setSuccess('Character profile saved successfully');

            // Refetch NFT details to get updated profile
            await fetchNftDetails(nft.id);
        } catch (error) {
            console.error('Failed to save character profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to save character profile');
        } finally {
            setSaving(false);
        }
    };

    // Show loading state
    if (status === 'loading' || loading) {
        return <LoadingDashboard />;
    }

    // Show error if NFT not found
    if (!nft) {
        return (
            <div className="p-4 md:p-6 h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center mb-6">
                        <Link href="/dashboard/assets" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold">NFT Character Profile</h1>
                    </div>

                    <div className="bg-myred-500 text-white p-4 rounded mb-6">
                        NFT not found or you don't have permission to access it.
                    </div>

                    <Link
                        href="/dashboard/assets"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded inline-flex items-center"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Assets
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/dashboard/assets" className="mr-4 p-2 hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold">Character Profile</h1>
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

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="flex flex-col md:flex-row">
                        {/* NFT Image */}
                        <div className="md:w-1/3 bg-gray-700">
                            <div className="relative h-64 md:h-full">
                                <Image
                                    src={nft.image_url || '/placeholder-nft.png'}
                                    alt={nft.name || `NFT #${nft.token_id}`}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* NFT Details */}
                        <div className="md:w-2/3 p-6">
                            <h2 className="text-xl font-bold mb-2">{nft.name || `NFT #${nft.token_id}`}</h2>
                            <p className="text-gray-400 mb-4">{nft.collection_name} • Token ID: {nft.token_id}</p>

                            <div className="bg-gray-700 p-4 rounded mb-4">
                                <h3 className="font-semibold mb-2">Traits</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {nft.token_metadata?.attributes?.map((attr: any, index: number) => (
                                        <div key={index} className="bg-gray-800 p-2 rounded">
                                            <p className="text-xs text-gray-400">{attr.trait_type}</p>
                                            <p className="font-medium">{attr.value}</p>
                                        </div>
                                    )) || <p className="text-gray-400 text-sm">No traits found</p>}
                                </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-300">
                                <AlertCircle size={16} className="text-myred-500 mr-2" />
                                <p>Create a character profile to use this NFT in your stories.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Character Profile Form */}
                <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4">Character Profile</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="character_name">
                                Character Name*
                            </label>
                            <input
                                type="text"
                                id="character_name"
                                name="character_name"
                                value={formData.character_name}
                                onChange={handleInputChange}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                placeholder="Enter character name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="character_description">
                                Character Description
                            </label>
                            <textarea
                                id="character_description"
                                name="character_description"
                                value={formData.character_description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                placeholder="Brief description of this character"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Personality Traits
                            </label>
                            <div className="flex mb-2">
                                <input
                                    type="text"
                                    value={traitInput}
                                    onChange={(e) => setTraitInput(e.target.value)}
                                    onKeyDown={handleTraitInputKeyDown}
                                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l focus:border-myred-500 focus:outline-none"
                                    placeholder="Add personality trait"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTrait}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-r"
                                >
                                    Add
                                </button>
                            </div>

                            {formData.personality_traits.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.personality_traits.map((trait, index) => (
                                        <div
                                            key={index}
                                            className="px-2 py-1 bg-myred-600 rounded-full text-sm flex items-center"
                                        >
                                            {trait}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTrait(trait)}
                                                className="ml-2 text-gray-300 hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="backstory">
                                Backstory
                            </label>
                            <textarea
                                id="backstory"
                                name="backstory"
                                value={formData.backstory}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                placeholder="Character's backstory and history"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="role_in_story">
                                Role in Story
                            </label>
                            <textarea
                                id="role_in_story"
                                name="role_in_story"
                                value={formData.role_in_story}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                placeholder="Character's role or function in your stories"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="visual_appearance">
                                Visual Appearance
                            </label>
                            <textarea
                                id="visual_appearance"
                                name="visual_appearance"
                                value={formData.visual_appearance}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                placeholder="Detailed description of the character's appearance"
                            />
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-3">Character Type</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_protagonist"
                                        name="is_protagonist"
                                        checked={formData.is_protagonist}
                                        onChange={handleCheckboxChange}
                                        className="w-4 h-4 border rounded focus:ring-3 focus:ring-myred-300 bg-gray-700 border-gray-600 mr-2"
                                    />
                                    <label htmlFor="is_protagonist" className="text-sm">
                                        Protagonist (Main Character)
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_antagonist"
                                        name="is_antagonist"
                                        checked={formData.is_antagonist}
                                        onChange={handleCheckboxChange}
                                        className="w-4 h-4 border rounded focus:ring-3 focus:ring-myred-300 bg-gray-700 border-gray-600 mr-2"
                                    />
                                    <label htmlFor="is_antagonist" className="text-sm">
                                        Antagonist (Villain)
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_supporting"
                                        name="is_supporting"
                                        checked={formData.is_supporting}
                                        onChange={handleCheckboxChange}
                                        className="w-4 h-4 border rounded focus:ring-3 focus:ring-myred-300 bg-gray-700 border-gray-600 mr-2"
                                    />
                                    <label htmlFor="is_supporting" className="text-sm">
                                        Supporting Character
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}