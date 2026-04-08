export async function readErrorMessageFromResponse(response: Response, fallback: string) {
    const raw = await response.text().catch(() => "");
    if (!raw) return fallback;

    try {
        const parsed = JSON.parse(raw) as { error?: unknown; message?: unknown };
        if (typeof parsed.error === "string" && parsed.error.trim()) return parsed.error.trim();
        if (typeof parsed.message === "string" && parsed.message.trim()) return parsed.message.trim();
    } catch {
        // Non-JSON body: fall through and use raw text when short enough.
    }

    return raw.length <= 240 ? raw : fallback;
}
