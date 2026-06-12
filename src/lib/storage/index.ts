import type { StorageProvider } from "./storage";
import { localStorageProvider } from "./local";
import { vercelBlobStorageProvider } from "./vercel-blob";

// Wähle den Storage-Driver dynamisch aus:
// 1. Explizit über die Umgebungsvariable STORAGE_DRIVER (z.B. "local" oder "vercel-blob")
// 2. Auf Vercel standardmäßig "vercel-blob" (Vercel setzt process.env.VERCEL === "1")
// 3. Andernfalls standardmäßig "local"
const driver =
    process.env.STORAGE_DRIVER ||
    (process.env.VERCEL === "1" ? "vercel-blob" : "local");

const storage: StorageProvider =
    driver === "vercel-blob" ? vercelBlobStorageProvider : localStorageProvider;

export default storage;

