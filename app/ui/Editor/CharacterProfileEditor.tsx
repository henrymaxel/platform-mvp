// app/ui/CharacterProfileEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, X } from 'lucide-react';
import { NFTCharacterProfile } from '@/app/lib/definitions';
import { createProfile, updateProfile, generateCharacterFromNFT } from '@/app/lib/actions/characterProfiles';
import NftImage from '@/app/ui/NFTImage';

interface CharacterProfileEditorProps {
    nftId: string;
    assetId?: string;
    profileId?: string;
    nftImage: string;
    nftName: string;
    initialData?: Partial<NFTCharacterProfile>;
    onClose: () => void;
    onSave: () => void;
}

export default function CharacterProfileEditor({
    nftId,
    assetId,
    profileId,
    nftImage,
    nftName,
    initialData,
    onClose,
    onSave
}: CharacterProfileEditorProps) {
    const [formData, setFormData] = useState<Partial<NFTCharacterProfile>>(initialData || {});
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleGenerateProfile = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const generatedProfile = await generateCharacterFromNFT(nftId);
            setFormData(prev => ({ ...prev, ...generatedProfile }));
        } catch (error) {
            console.error('Failed to generate profile:', error);
            setError('Failed to generate character profile');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const submitFormData = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'personality_traits' && value) {
                    submitFormData.append(key, JSON.stringify(value));
                } else if (typeof value === 'boolean') {
                    submitFormData.append(key, value.toString());
                } else if (value) {
                    submitFormData.append(key, value as string);
                }
            });

            if (profileId) {
                // Update existing profile
                await updateProfile(profileId, submitFormData);
            } else if (assetId) {
                // Create new profile
                await createProfile(assetId, submitFormData);
            } else {
                throw new Error('Missing profileId or assetId');
            }

            onSave();
        } catch (error) {
            console.error('Failed to save profile:', error);
            setError('Failed to save character profile');
        } finally {
            setIsSaving(false);
        }
    };

    const isFormComplete =
        formData.character_name &&
        formData.character_description &&
        formData.backstory &&
        formData.role_in_story &&
        formData.visual_appearance &&
        (formData.is_protagonist || formData.is_antagonist || formData.is_supporting);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Character Profile: {nftName}</h2>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NFT Image */}
                        <div className="bg-gray-700 rounded-lg overflow-hidden aspect-square relative">
                            <NftImage
                                imageUrl={nftImage}
                                alt={nftName}
                            />
                        </div>

                        {/* Basic Character Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="character_name">
                                    Character Name*
                                </label>
                                <input
                                    type="text"
                                    id="character_name"
                                    name="character_name"
                                    value={formData.character_name || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                    placeholder="Character Name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="character_description">
                                    Character Description*
                                </label>
                                <textarea
                                    id="character_description"
                                    name="character_description"
                                    value={formData.character_description || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                    placeholder="A brief description of your character"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Character Type*</label>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_protagonist"
                                            name="is_protagonist"
                                            checked={formData.is_protagonist || false}
                                            onChange={handleCheckboxChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="is_protagonist">Protagonist</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_antagonist"
                                            name="is_antagonist"
                                            checked={formData.is_antagonist || false}
                                            onChange={handleCheckboxChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="is_antagonist">Antagonist</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_supporting"
                                            name="is_supporting"
                                            checked={formData.is_supporting || false}
                                            onChange={handleCheckboxChange}
                                            className="mr-2"
                                        />
                                        <label htmlFor="is_supporting">Supporting Character</label>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Select at least one role for this character</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleGenerateProfile}
                                disabled={isGenerating}
                                className="w-full p-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={16} className="mr-2" />
                                        Generate Character from NFT Traits
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Extended Character Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="backstory">
                                Backstory*
                            </label>
                            <textarea
                                id="backstory"
                                name="backstory"
                                value={formData.backstory || ''}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                placeholder="Character's history and background"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="role_in_story">
                                Role in Story*
                            </label>
                            <textarea
                                id="role_in_story"
                                name="role_in_story"
                                value={formData.role_in_story || ''}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                                placeholder="Character's purpose and arc in the narrative"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="visual_appearance">
                            Visual Appearance*
                        </label>
                        <textarea
                            id="visual_appearance"
                            name="visual_appearance"
                            value={formData.visual_appearance || ''}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-myred-500 focus:outline-none"
                            placeholder="Detailed description of character's appearance"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving || !isFormComplete}
                            className="px-4 py-2 bg-myred-600 hover:bg-myred-700 rounded flex items-center disabled:opacity-50"
                        >
                            {isSaving ? (
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