import type { StorageProvider } from "./storage";
import { localStorageProvider } from "./local";

// To switch providers later, just check an env var here:
// if (process.env.STORAGE_DRIVER === "s3") { ... }
const storage: StorageProvider = localStorageProvider;

export default storage;
