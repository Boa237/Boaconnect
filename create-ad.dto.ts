import { IsDateString, IsIn, IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdDto {
  @ApiProperty({ enum: ['home_banner', 'category_top', 'search_top'] })
  @IsIn(['home_banner', 'category_top', 'search_top'])
  placement: 'home_banner' | 'category_top' | 'search_top';

  @ApiProperty({ description: "URL de l'image de la bannière." })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Lien externe ouvert au clic (si non liée à une annonce).' })
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiPropertyOptional({ description: "ID d'une annonce à promouvoir (alternative à targetUrl)." })
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2026-07-15T00:00:00.000Z' })
  @IsDateString()
  endsAt: string;

  @ApiPropertyOptional({ example: 50000, description: 'Budget en FCFA (indicatif).' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget?: number;
}
