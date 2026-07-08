import { IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty({ description: 'ID de la catégorie (voir GET /categories)' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Belle maison 3 chambres à Bastos', minLength: 5, maxLength: 120 })
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Maison familiale avec jardin, proche des ambassades...' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({ example: 180000, description: 'Prix en FCFA. Omettre si "prix sur demande".' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ enum: ['total', 'per_month', 'per_night', 'on_request'], default: 'on_request' })
  @IsOptional()
  @IsIn(['total', 'per_month', 'per_night', 'on_request'])
  priceUnit?: string;

  @ApiProperty({ example: 'Yaoundé II', description: "L'un des 7 arrondissements de Yaoundé." })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Bastos' })
  @IsString()
  neighborhood: string;

  @ApiPropertyOptional({ example: 3.8667 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 11.5167 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: '+237690000001' })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional({ example: '+237690000001' })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
