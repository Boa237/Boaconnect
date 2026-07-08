import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageProvider } from './storage.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  constructor(private config: ConfigService) {}

  private get uploadDir(): string {
    return path.join(process.cwd(), this.config.get('uploads.dir'));
  }

  async savePhoto(buffer: Buffer, filename: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    const appUrl = this.config.get('app.url');
    return `${appUrl}/uploads/${filename}`;
  }

  async deletePhoto(url: string): Promise<void> {
    const filename = url.split('/uploads/')[1];
    if (!filename) return;
    const filePath = path.join(this.uploadDir, filename);
    await fs.unlink(filePath).catch(() => undefined);
  }
}
