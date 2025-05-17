// app/api/cron/verify-nft-ownership/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAllNFTOwnerships, handleRoyaltyDistribution } from '@/app/lib/services/ownershipVerificationService';

export async function GET(request: NextRequest) {
  try {
    // Verify API key for security
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify NFT ownerships
    const verificationResult = await verifyAllNFTOwnerships();
    
    // Update royalty distribution
    await handleRoyaltyDistribution();
    
    return NextResponse.json({ 
      success: true, 
      verified: verificationResult.success,
      failed: verificationResult.failed
    });
  } catch (error) {
    console.error('NFT ownership verification failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}