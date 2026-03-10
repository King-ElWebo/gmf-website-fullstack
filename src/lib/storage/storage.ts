// Storage provider interface.
// Any provider (local, S3, R2, etc.) must implement this.
export interface StorageProvider {
    /** Persist a file and return its public URL and storage key. */
    save(file: File): Promise<{ url: string; key: string }>;
    /** Remove a previously saved file using its storage key. */
    delete(key: string): Promise<void>;
}
