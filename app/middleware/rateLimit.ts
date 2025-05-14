import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const ratelimitMap = new Map();

export function rateLimit(request: NextRequest) {
    const ip = request.ip ?? '127.0.0.1';
    const limit = 100;
    const timeWindow = 60 * 100; 

    const currentTime = Date.now();
    const requestLog = ratelimitMap.get(ip) || [];

    const recentRequests = requestLog.filter(
        (timestamp: number) => currentTime - timestamp < timeWindow
    );

    if (recentRequests.length >= limit) {
        return NextResponse.json(
            { error: 'Too many requests, please try again later' },
            { status: 429 }
        );
    }

    ratelimitMap.set(ip, [...recentRequests, currentTime]);

    return NextResponse.next();
}