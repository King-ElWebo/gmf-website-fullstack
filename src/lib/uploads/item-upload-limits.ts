export const ITEM_UPLOAD_MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB pro Datei
export const ITEM_UPLOAD_MAX_BATCH_BYTES = 40 * 1024 * 1024; // 40 MB pro Upload-Request

type UploadLikeFile = {
    name: string;
    size: number;
};

type UploadValidationResult =
    | {
        ok: true;
    }
    | {
        ok: false;
        code: "no_files" | "file_too_large" | "batch_too_large";
        status: 400 | 413;
        message: string;
    };

export function formatBytes(bytes: number) {
    const valueMb = bytes / (1024 * 1024);
    return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(valueMb)} MB`;
}

export function validateItemUploadFiles(files: UploadLikeFile[]): UploadValidationResult {
    if (files.length === 0) {
        return {
            ok: false,
            code: "no_files",
            status: 400,
            message: "Keine gültigen Dateien ausgewählt.",
        };
    }

    const oversizedFile = files.find((file) => file.size > ITEM_UPLOAD_MAX_FILE_BYTES);
    if (oversizedFile) {
        return {
            ok: false,
            code: "file_too_large",
            status: 413,
            message: `Die Datei "${oversizedFile.name}" ist zu groß (${formatBytes(oversizedFile.size)}). Maximal erlaubt sind ${formatBytes(ITEM_UPLOAD_MAX_FILE_BYTES)} pro Datei.`,
        };
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > ITEM_UPLOAD_MAX_BATCH_BYTES) {
        return {
            ok: false,
            code: "batch_too_large",
            status: 413,
            message: `Die gesamte Upload-Auswahl ist zu groß (${formatBytes(totalSize)}). Maximal erlaubt sind ${formatBytes(ITEM_UPLOAD_MAX_BATCH_BYTES)} pro Upload.`,
        };
    }

    return { ok: true };
}
