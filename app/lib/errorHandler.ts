export function handleApiError(error: unknown) {
    console.log("API error: ", error);

    if (process.env.NODE_ENV === 'production') {
        return { error: 'An unexpected error occurred' };
    }

    return {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    };
}