import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { STORAGE_PROVIDER } from './storage/storage.interface';
import { LocalStorageProvider } from './storage/local-storage.provider';

@Module({
  imports: [MulterModule.register({ storage: undefined })], // on garde les fichiers en mémoire (buffer) pour les passer à sharp
  controllers: [UploadsController],
  providers: [UploadsService, { provide: STORAGE_PROVIDER, useClass: LocalStorageProvider }],
  exports: [UploadsService],
})
export class UploadsModule {}
