import { Body, Controller, Post, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Étape 1 : envoie un code OTP par SMS au numéro fourni.' })
  @Post('request-otp')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Étape 2 : vérifie le code OTP et renvoie les tokens JWT (crée le compte si besoin).' })
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @ApiOperation({ summary: "Renouvelle l'access token à partir d'un refresh token valide." })
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complète le profil (nom, ville, quartier) après la première connexion.' })
  @Patch('complete-profile')
  completeProfile(@CurrentUser() user, @Body() dto: CompleteProfileDto) {
    return this.authService.completeProfile(user.userId, dto);
  }
}
