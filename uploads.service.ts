import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { STORAGE_PROVIDER, StorageProvider } from './storage/storage.interface';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_PROVIDER) private storage: StorageProvider,
    private config: ConfigService,
  ) {}

  /** Redimensionne/compresse chaque photo puis la sauvegarde. Retourne les URLs publiques. */
  async savePhotos(files: Express.Multer.File[]): Promise<string[]> {
    const maxPhotos = this.config.get<number>('uploads.maxPhotosPerListing');
    if (files.length > maxPhotos) {
      throw new BadRequestException(`Maximum ${maxPhotos} photos par annonce.`);
    }

    const urls: string[] = [];
    for (const file of files) {
      // Compression + redimensionnement : limite la bande passante consommée
      // par les utilisateurs, un enjeu réel avec une connectivité mobile variable.
      const optimized = await sharp(file.buffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 78 })
        .toBuffer();

      const filename = `${uuid()}.jpg`;
      const url = await this.storage.savePhoto(optimized, filename);
      urls.push(url);
    }
    return urls;
  }
}
