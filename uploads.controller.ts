import { BadRequestException, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @ApiOperation({ summary: 'Upload jusqu\'à 6 photos (JPG/PNG/WEBP, 5 Mo max chacune). Renvoie les URLs à rattacher à une annonce.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { photos: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @Post('photos')
  @UseInterceptors(
    FilesInterceptor('photos', 6, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo / fichier
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpe?g|png|webp)$/)) {
          return cb(new BadRequestException('Seules les images JPG, PNG ou WEBP sont acceptées.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier reçu.');
    }
    const urls = await this.uploadsService.savePhotos(files);
    return { urls };
  }
}
