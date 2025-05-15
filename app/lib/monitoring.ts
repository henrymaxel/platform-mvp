type PerformanceData = {
    operation: number;
    duration: number;
    timestamp: Date;
}

const recentSlowOperations: PerformanceData[] = [];
const MAX_STORED_OPERATIONS = 100;

export async function measurePerformance<T> (
    name: string,
    operation: () => Promise<T>,
    threshold = 1000
) : Promise<T> {
    const start = performance.now();

    try {
        return await operation();
    } finally {
        const duration = performance.now() - start;
        if (duration > threshold) {
            const data = {
                operation: name,
                duration,
                timestamp: new Date()
            };

            recentSlowOperations.push(data);
            if (recentSlowOperations.length > MAX_STORED_OPERATIONS) {
                recentSlowOperations.shift(); // remove oldest
            }

            console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);

            if (process.env.NODE_ENV === 'production') {
                // sendToMonitoringService(data); 
                // in prod send to monitoring service
            }
        }
    }
}
export function getRecentSlowOperations(): PerformanceData[] {
    return [...recentSlowOperations];
}

