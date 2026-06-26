export function getBaseUrl(): string {
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
    const url = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;

    if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
        if (isProduction) {
            throw new Error("CRITICAL: APP_URL is missing or set to localhost in production!");
        }
        return "http://localhost:3000";
    }

    // Trailing Slash entfernen falls vorhanden
    return url.replace(/\/$/, "");
}
