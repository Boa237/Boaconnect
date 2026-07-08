import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { OtpCode } from './entities/otp-code.entity';
import { UsersService } from '../users/users.service';
import { SmsService } from './sms/sms.service';

/**
 * Tests unitaires du cœur du système d'authentification (OTP).
 * Toutes les dépendances externes (DB, JWT, SMS) sont mockées : ces tests
 * valident la LOGIQUE du service, pas l'intégration réelle avec Postgres.
 */
describe('AuthService', () => {
  let service: AuthService;
  let otpRepo: { save: jest.Mock; create: jest.Mock; findOne: jest.Mock };
  let usersService: Partial<UsersService>;
  let smsService: Partial<SmsService>;

  beforeEach(async () => {
    otpRepo = {
      save: jest.fn((x) => Promise.resolve(x)),
      create: jest.fn((x) => x),
      findOne: jest.fn(),
    };

    usersService = {
      findByPhone: jest.fn(),
      createFromPhone: jest.fn(),
    };

    smsService = { sendOtp: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(OtpCode), useValue: otpRepo },
        { provide: UsersService, useValue: usersService },
        { provide: SmsService, useValue: smsService },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('fake.jwt.token'), verify: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const values: Record<string, any> = {
                'otp.length': 6,
                'otp.expiresMinutes': 5,
                'otp.maxAttempts': 5,
                'jwt.accessSecret': 'test-secret',
                'jwt.accessExpiresIn': '15m',
                'jwt.refreshSecret': 'test-refresh-secret',
                'jwt.refreshExpiresIn': '30d',
              };
              return values[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('requestOtp', () => {
    it('génère un code, le hash, le sauvegarde et l\'envoie par SMS', async () => {
      const result = await service.requestOtp({ phoneNumber: '+237690000001' });

      expect(otpRepo.save).toHaveBeenCalled();
      expect(smsService.sendOtp).toHaveBeenCalledWith('+237690000001', expect.any(String));
      expect(result.expiresInMinutes).toBe(5);

      // Le code en clair ne doit jamais être stocké : on vérifie que codeHash != code envoyé
      const savedEntity = otpRepo.save.mock.calls[0][0];
      const sentCode = (smsService.sendOtp as jest.Mock).mock.calls[0][1];
      expect(savedEntity.codeHash).not.toBe(sentCode);
      expect(await bcrypt.compare(sentCode, savedEntity.codeHash)).toBe(true);
    });
  });

  describe('verifyOtp', () => {
    it('rejette un code si aucun OTP valide n\'existe (expiré ou inexistant)', async () => {
      otpRepo.findOne.mockResolvedValue(null);
      await expect(service.verifyOtp({ phoneNumber: '+237690000001', code: '123456' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejette un code incorrect et incrémente le compteur de tentatives', async () => {
      const validHash = await bcrypt.hash('999999', 10);
      otpRepo.findOne.mockResolvedValue({ id: '1', codeHash: validHash, attempts: 0, isUsed: false });

      await expect(service.verifyOtp({ phoneNumber: '+237690000001', code: '111111' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(otpRepo.save).toHaveBeenCalledWith(expect.objectContaining({ attempts: 1 }));
    });

    it('bloque après trop de tentatives, même avec un code par ailleurs valide', async () => {
      const validHash = await bcrypt.hash('123456', 10);
      otpRepo.findOne.mockResolvedValue({ id: '1', codeHash: validHash, attempts: 5, isUsed: false });

      await expect(service.verifyOtp({ phoneNumber: '+237690000001', code: '123456' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('crée un nouvel utilisateur et renvoie isNewUser=true si le numéro est inconnu', async () => {
      const validHash = await bcrypt.hash('123456', 10);
      otpRepo.findOne.mockResolvedValue({ id: '1', codeHash: validHash, attempts: 0, isUsed: false });
      (usersService.findByPhone as jest.Mock).mockResolvedValue(null);
      (usersService.createFromPhone as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phoneNumber: '+237690000001',
        role: 'user',
        isProfileComplete: false,
      });

      const result = await service.verifyOtp({ phoneNumber: '+237690000001', code: '123456' });

      expect(result.isNewUser).toBe(true);
      expect(result.accessToken).toBe('fake.jwt.token');
      expect(usersService.createFromPhone).toHaveBeenCalledWith('+237690000001');
    });

    it('connecte un utilisateur existant sans le recréer', async () => {
      const validHash = await bcrypt.hash('123456', 10);
      otpRepo.findOne.mockResolvedValue({ id: '1', codeHash: validHash, attempts: 0, isUsed: false });
      (usersService.findByPhone as jest.Mock).mockResolvedValue({
        id: 'user-existing',
        phoneNumber: '+237690000001',
        role: 'user',
        isProfileComplete: true,
      });

      const result = await service.verifyOtp({ phoneNumber: '+237690000001', code: '123456' });

      expect(result.isNewUser).toBe(false);
      expect(usersService.createFromPhone).not.toHaveBeenCalled();
    });
  });
});
