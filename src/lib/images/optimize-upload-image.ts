import path from "path";

export interface OptimizationResult {
    buffer: Buffer;
    filename: string;
    mimeType: string;
    size: number;
    wasOptimized: boolean;
}

const SUPPORTED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif"
]);

/**
 * Optimizes an uploaded image using sharp before it is saved.
 * - Resizes the image to fit within 1920x1920px (without upscaling)
 * - Converts to WebP with a balanced quality of 80
 * - Normalizes filenames and changes the extension to .webp
 * - Leaves unsupported formats (e.g., videos) untouched
 */
export async function optimizeUploadImage(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string
): Promise<OptimizationResult> {
    const isImage = SUPPORTED_MIME_TYPES.has(mimeType.toLowerCase());

    if (!isImage) {
        return {
            buffer,
            filename: originalFilename,
            mimeType,
            size: buffer.length,
            wasOptimized: false
        };
    }

    try {
        const ext = path.extname(originalFilename).toLowerCase();
        const base = path.basename(originalFilename, ext);
        
        // Normalize filename (lowercase, alphanumeric, dashes/underscores only)
        let cleanBase = base.toLowerCase()
            .replace(/[^a-z0-9_-]/g, "_")
            .replace(/_+/g, "_")
            .replace(/-+/g, "-")
            .replace(/^_+|_+$/g, "")
            .replace(/-+|-+$/g, "");

        if (!cleanBase) {
            cleanBase = "image";
        }

        const newFilename = `${cleanBase}.webp`;
        const newMimeType = "image/webp";

        // Optimize using sharp (imported dynamically to catch native loading errors gracefully)
        const sharpModule = await import("sharp");
        const sharp = sharpModule.default || sharpModule;

        const optimizedBuffer = await (sharp as any)(buffer)
            .resize({
                width: 1920,
                height: 1920,
                fit: "inside",
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer();

        const originalSize = buffer.length;
        const optimizedSize = optimizedBuffer.length;
        const savingsPct = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

        console.log(
            `[Image Optimization] Optimized ${originalFilename} -> ${newFilename}. ` +
            `Size change: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(optimizedSize / 1024).toFixed(1)} KB ` +
            `(${savingsPct}% space saved).`
        );

        return {
            buffer: optimizedBuffer,
            filename: newFilename,
            mimeType: newMimeType,
            size: optimizedSize,
            wasOptimized: true
        };
    } catch (error) {
        console.error(`[Image Optimization] Failed to optimize image ${originalFilename}:`, error);
        // Fall back to original file if sharp fails
        return {
            buffer,
            filename: originalFilename,
            mimeType,
            size: buffer.length,
            wasOptimized: false
        };
    }
}
