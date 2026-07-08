import { IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({ example: '+237690000001', description: 'Numéro de téléphone camerounais au format international.' })
  @IsPhoneNumber('CM', { message: 'Veuillez fournir un numéro de téléphone camerounais valide (+237...)' })
  phoneNumber: string;
}
