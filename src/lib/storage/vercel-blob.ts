import { put, del } from "@vercel/blob";
import type { StorageProvider } from "./storage";
import path from "path";

// 15 MB in Bytes
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif"
]);

const FORBIDDEN_EXTENSIONS = new Set([
    ".exe", ".dll", ".bat", ".cmd", ".sh", ".bash", ".php", ".phtml", 
    ".pl", ".py", ".js", ".ts", ".html", ".htm", ".jsp", ".asp", ".aspx", ".cgi"
]);

class VercelBlobStorage implements StorageProvider {
    async save(file: File): Promise<{ url: string; key: string }> {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            throw new Error(
                "Upload fehlgeschlagen: BLOB_READ_WRITE_TOKEN ist nicht in den Umgebungsvariablen konfiguriert."
            );
        }

        // 1. Check file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                `Upload fehlgeschlagen: Die Datei "${file.name}" überschreitet die maximale Dateigröße von 15 MB.`
            );
        }

        // 2. Validate file extension
        const ext = path.extname(file.name).toLowerCase();
        if (FORBIDDEN_EXTENSIONS.has(ext)) {
            throw new Error(
                `Upload fehlgeschlagen: Der Dateityp "${ext}" ist aus Sicherheitsgründen nicht erlaubt.`
            );
        }

        // 3. Validate MIME type
        const mimeType = file.type.toLowerCase();
        const isImage = mimeType.startsWith("image/");
        const isVideo = mimeType.startsWith("video/");

        if (isImage) {
            if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
                throw new Error(
                    `Upload fehlgeschlagen: Das Bildformat "${mimeType}" wird nicht unterstützt. Erlaubt sind JPEG, PNG, WebP und AVIF.`
                );
            }
        } else if (isVideo) {
            if (!mimeType.startsWith("video/")) {
                throw new Error(
                    `Upload fehlgeschlagen: Das Videoformat "${mimeType}" wird nicht unterstützt.`
                );
            }
        } else {
            throw new Error(
                `Upload fehlgeschlagen: Der MIME-Type "${mimeType}" ist nicht zulässig. Nur Bilder und Videos sind erlaubt.`
            );
        }

        // 4. Sanitize and clean filename
        const baseName = path.basename(file.name, ext);
        const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
        const cleanName = `${Date.now()}-${cleanBase}${ext}`;
        const pathname = `uploads/${cleanName}`;

        try {
            const blob = await put(pathname, file, {
                access: "public",
                token,
            });

            return {
                url: blob.url,
                key: blob.url, // URL as the key for Vercel Blob
            };
        } catch (error) {
            console.error("[VercelBlobStorage] put error:", error);
            const msg = error instanceof Error ? error.message : "Unbekannter Vercel Blob Fehler";
            throw new Error(`Upload zu Vercel Blob fehlgeschlagen: ${msg}`);
        }
    }

    async delete(key: string): Promise<void> {
        // Safe check: Only delete if key is a remote Vercel Blob URL
        if (!key || !key.startsWith("https://")) {
            console.log(`[VercelBlobStorage] Skipping delete for non-remote key: ${key}`);
            return;
        }

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            console.error(
                "[VercelBlobStorage] Löschen fehlgeschlagen: BLOB_READ_WRITE_TOKEN ist nicht konfiguriert."
            );
            return;
        }

        try {
            await del(key, { token });
        } catch (error) {
            console.error(`[VercelBlobStorage] Fehler beim Löschen von Blob ${key}:`, error);
        }
    }
}

export const vercelBlobStorageProvider = new VercelBlobStorage();
