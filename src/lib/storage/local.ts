import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { StorageProvider } from "./storage";

class LocalStorage implements StorageProvider {
    private uploadDir: string;

    constructor() {
        // public/uploads – Next.js serves this as /uploads/<file>
        this.uploadDir = path.join(process.cwd(), "public", "uploads");
    }

    async save(file: File): Promise<{ url: string; key: string }> {
        const ext = path.extname(file.name).toLowerCase() || ".bin";
        const key = `${randomUUID()}${ext}`;
        const dest = path.join(this.uploadDir, key);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(dest, buffer);

        return { url: `/uploads/${key}`, key };
    }

    async delete(key: string): Promise<void> {
        const filePath = path.join(this.uploadDir, key);
        try {
            await unlink(filePath);
        } catch {
            // File already gone – that's fine
        }
    }
}

export const localStorageProvider = new LocalStorage();
