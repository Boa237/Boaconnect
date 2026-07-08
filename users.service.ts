import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteProfileDto } from '../auth/dto/complete-profile.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  findByPhone(phoneNumber: string) {
    return this.usersRepo.findOne({ where: { phoneNumber } });
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  createFromPhone(phoneNumber: string) {
    const user = this.usersRepo.create({
      phoneNumber,
      isPhoneVerified: true,
      isProfileComplete: false,
      role: Role.USER,
    });
    return this.usersRepo.save(user);
  }

  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const user = await this.findById(userId);
    Object.assign(user, dto, { isProfileComplete: true });
    return this.usersRepo.save(user);
  }

  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.findById(userId);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  /** Utilisé par le seed / la console admin pour créer le tout premier administrateur. */
  async promoteToAdmin(phoneNumber: string) {
    const user = await this.findByPhone(phoneNumber);
    if (!user) throw new NotFoundException('Aucun utilisateur avec ce numéro.');
    user.role = Role.ADMIN;
    return this.usersRepo.save(user);
  }
}
