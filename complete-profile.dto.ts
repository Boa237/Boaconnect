import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteProfileDto {
  @ApiProperty({ example: 'Aïcha Souley' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiPropertyOptional({ example: 'Yaoundé II', enum: ['Yaoundé I', 'Yaoundé II', 'Yaoundé III', 'Yaoundé IV', 'Yaoundé V', 'Yaoundé VI', 'Yaoundé VII'] })
  @IsOptional()
  @IsIn(['Yaoundé I', 'Yaoundé II', 'Yaoundé III', 'Yaoundé IV', 'Yaoundé V', 'Yaoundé VI', 'Yaoundé VII'])
  city?: string;

  @ApiPropertyOptional({ example: 'Bastos' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ enum: ['fr', 'en'] })
  @IsOptional()
  @IsIn(['fr', 'en'])
  preferredLanguage?: 'fr' | 'en';
}
