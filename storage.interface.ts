/**
 * Interface de stockage de fichiers. L'implémentation par défaut écrit sur le
 * disque local (voir local-storage.provider.ts). Pour passer en production sur
 * S3/MinIO, créez un S3StorageProvider implémentant la même interface et
 * changez le provider injecté dans uploads.module.ts — rien d'autre ne bouge.
 */
export interface StorageProvider {
  savePhoto(buffer: Buffer, filename: string): Promise<string>; // retourne l'URL publique
  deletePhoto(url: string): Promise<void>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
