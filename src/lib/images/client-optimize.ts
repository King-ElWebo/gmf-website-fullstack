/**
 * Client-side image pre-optimization utility.
 * Resizes and compresses images in the browser before upload to prevent
 * hitting Vercel's strict 4.5 MB request body limit.
 */

export async function clientOptimizeImage(file: File): Promise<File> {
    const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const fileType = file.type.toLowerCase();

    // Bypass optimization for videos and unsupported files
    if (!supportedTypes.includes(fileType)) {
        return file;
    }

    return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const maxDim = 1920;
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions (fit inside 1920x1920, no enlargement)
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(file);
                return;
            }

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert canvas content to webp blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Normalize the extension to .webp
                        const originalName = file.name;
                        const extIdx = originalName.lastIndexOf(".");
                        const baseName = extIdx !== -1 ? originalName.slice(0, extIdx) : originalName;
                        const newFilename = `${baseName}.webp`;

                        const optimizedFile = new File([blob], newFilename, {
                            type: "image/webp",
                            lastModified: Date.now(),
                        });

                        console.log(
                            `[Client Optimization] Compressed ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) -> ` +
                            `${optimizedFile.name} (${(optimizedFile.size / 1024).toFixed(1)} KB)`
                        );

                        resolve(optimizedFile);
                    } else {
                        resolve(file);
                    }
                },
                "image/webp",
                0.80 // quality matching server-side settings
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };

        img.src = objectUrl;
    });
}
