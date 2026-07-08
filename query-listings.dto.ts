import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryListingsDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Yaoundé II' }) @IsOptional() @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Bastos' }) @IsOptional() @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Recherche plein texte sur le titre.' }) @IsOptional() @IsString()
  q?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ['newest', 'price_asc', 'price_desc'] })
  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc'])
  sort?: string;

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number)
  limit?: number = 20;
}
