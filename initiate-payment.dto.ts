import { IsIn, IsNumber, IsOptional, IsPhoneNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ enum: ['orange_money', 'mtn_momo'] })
  @IsIn(['orange_money', 'mtn_momo'])
  provider: 'orange_money' | 'mtn_momo';

  @ApiProperty({ enum: ['listing_boost', 'subscription'] })
  @IsIn(['listing_boost', 'subscription'])
  type: 'listing_boost' | 'subscription';

  @ApiPropertyOptional({ description: "ID de l'annonce à booster (requis si type=listing_boost)." })
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @ApiProperty({ example: 2000, minimum: 100, description: 'Montant en FCFA.' })
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({ example: '+237690000001' })
  @IsPhoneNumber('CM')
  phoneNumber: string;
}
