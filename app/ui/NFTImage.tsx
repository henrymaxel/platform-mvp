'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

// Array of IPFS gateways to try
const IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    'https://infura-ipfs.io/ipfs/',
    'https://ipfs.infura.io/ipfs/',
    'https://ipfs.filebase.io/ipfs/'
];

interface NftImageProps {
    imageUrl: string | null;
    alt: string;
    className?: string;
}

export default function NftImage({ imageUrl, alt, className }: NftImageProps) {
    const [currentSrc, setCurrentSrc] = useState<string | null>(null);
    const [gatewayIndex, setGatewayIndex] = useState(0);
    const [failed, setFailed] = useState(false);

    // Process the image URL
    React.useEffect(() => {
        if (!imageUrl) {
            setFailed(true);
            return;
        }

        // Reset state when imageUrl changes
        setFailed(false);

        if (imageUrl.startsWith('ipfs://')) {
            // Start with the first gateway
            setCurrentSrc(IPFS_GATEWAYS[0] + imageUrl.replace('ipfs://', ''));
            setGatewayIndex(0);
        } else if (imageUrl.startsWith('http')) {
            // Use the URL directly if it's not IPFS
            setCurrentSrc(imageUrl);
        } else {
            // Unknown format, use fallback
            setFailed(true);
        }
    }, [imageUrl]);

    const handleImageError = () => {
        if (!imageUrl) {
            setFailed(true);
            return;
        }

        // If it's an IPFS URL, try the next gateway
        if (imageUrl.startsWith('ipfs://')) {
            const nextIndex = gatewayIndex + 1;
            if (nextIndex < IPFS_GATEWAYS.length) {
                console.log(`Trying next IPFS gateway (${nextIndex + 1}/${IPFS_GATEWAYS.length})`);
                setCurrentSrc(IPFS_GATEWAYS[nextIndex] + imageUrl.replace('ipfs://', ''));
                setGatewayIndex(nextIndex);
            } else {
                console.error('All IPFS gateways failed for:', imageUrl);
                setFailed(true);
            }
        } else {
            // Non-IPFS URL failed
            console.error('Image failed to load:', imageUrl);
            setFailed(true);
        }
    };

    if (failed || !currentSrc) {
        return (
            <div className={`flex items-center justify-center h-full bg-gray-700 ${className}`}>
                <User size={64} className="text-gray-500" />
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full ${className}`}>
            <Image
                src={currentSrc}
                alt={alt}
                fill
                style={{ objectFit: 'cover' }}
                onError={handleImageError}
                unoptimized
            />
        </div>
    );
}