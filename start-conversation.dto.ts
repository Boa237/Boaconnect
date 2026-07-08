import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartConversationDto {
  @ApiProperty({ description: "ID de l'utilisateur destinataire (ex: propriétaire de l'annonce)." })
  @IsUUID()
  recipientId: string;

  @ApiPropertyOptional({ description: "ID de l'annonce concernée, pour donner du contexte." })
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @ApiProperty({ example: 'Bonjour, votre annonce est-elle toujours disponible ?' })
  @IsString()
  @MinLength(1)
  message: string;
}
