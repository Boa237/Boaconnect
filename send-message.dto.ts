import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'Oui, elle est toujours disponible.' })
  @IsString()
  @MinLength(1)
  body: string;
}
