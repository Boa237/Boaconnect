import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { OtpCode } from './entities/otp-code.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { SmsService } from './sms/sms.service';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpCode]),
    PassportModule,
    JwtModule.register({}), // secrets fournis dynamiquement par AuthService/JwtStrategy
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    SmsService,
    // Guards appliqués globalement : JWT obligatoire partout sauf @Public(),
    // puis vérification des rôles pour les routes @Roles(...).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
