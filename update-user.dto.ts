import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Aïcha Souley' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Yaoundé II' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Bastos' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePhotoUrl?: string;
}
