import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OtpCode } from './entities/otp-code.entity';
import { SmsService } from './sms/sms.service';
import { UsersService } from '../users/users.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpCode) private otpRepo: Repository<OtpCode>,
    private usersService: UsersService,
    private smsService: SmsService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /** Étape 1 : génère un OTP et l'envoie par SMS au numéro fourni. */
  async requestOtp(dto: RequestOtpDto): Promise<{ message: string; expiresInMinutes: number }> {
    const length = this.config.get<number>('otp.length');
    const expiresMinutes = this.config.get<number>('otp.expiresMinutes');

    const code = this.generateNumericCode(length);
    const codeHash = await bcrypt.hash(code, 10);

    await this.otpRepo.save(
      this.otpRepo.create({
        phoneNumber: dto.phoneNumber,
        codeHash,
        expiresAt: new Date(Date.now() + expiresMinutes * 60 * 1000),
      }),
    );

    await this.smsService.sendOtp(dto.phoneNumber, code);

    return { message: 'Un code de vérification a été envoyé par SMS.', expiresInMinutes: expiresMinutes };
  }

  /**
   * Étape 2 : vérifie le code OTP. Si l'utilisateur n'existe pas encore,
   * un compte est créé (isProfileComplete=false) ; sinon il est connecté directement.
   * Retourne des tokens JWT (access + refresh) dans tous les cas.
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const maxAttempts = this.config.get<number>('otp.maxAttempts');

    const otpRecord = await this.otpRepo.findOne({
      where: { phoneNumber: dto.phoneNumber, isUsed: false, expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Code invalide ou expiré. Veuillez en redemander un.');
    }

    if (otpRecord.attempts >= maxAttempts) {
      throw new BadRequestException('Trop de tentatives. Veuillez redemander un nouveau code.');
    }

    const isValid = await bcrypt.compare(dto.code, otpRecord.codeHash);
    if (!isValid) {
      otpRecord.attempts += 1;
      await this.otpRepo.save(otpRecord);
      throw new UnauthorizedException('Code incorrect.');
    }

    otpRecord.isUsed = true;
    await this.otpRepo.save(otpRecord);

    let user = await this.usersService.findByPhone(dto.phoneNumber);
    let isNewUser = false;
    if (!user) {
      user = await this.usersService.createFromPhone(dto.phoneNumber);
      isNewUser = true;
    }

    const tokens = this.issueTokens(user.id, user.phoneNumber, user.role);
    return { ...tokens, isNewUser, isProfileComplete: user.isProfileComplete, user };
  }

  /** Complète le profil (nom, ville, langue) après la toute première vérification OTP. */
  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const user = await this.usersService.completeProfile(userId, dto);
    return user;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('jwt.refreshSecret'),
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();
      return this.issueTokens(user.id, user.phoneNumber, user.role);
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }
  }

  private issueTokens(userId: string, phoneNumber: string, role: string) {
    const payload = { sub: userId, phoneNumber, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('jwt.accessSecret'),
      expiresIn: this.config.get('jwt.accessExpiresIn'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('jwt.refreshSecret'),
      expiresIn: this.config.get('jwt.refreshExpiresIn'),
    });
    return { accessToken, refreshToken };
  }

  private generateNumericCode(length: number): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min)).toString();
  }
}
