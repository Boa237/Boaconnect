import { IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: '+237690000001' })
  @IsPhoneNumber('CM')
  phoneNumber: string;

  @ApiProperty({ example: '123456', description: 'Code reçu par SMS (4 à 6 chiffres).' })
  @IsString()
  @Length(4, 6)
  code: string;
}
