import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude() // jamais renvoyé dans les réponses API
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: 'fr' })
  preferredLanguage: string;

  @Column({ nullable: true })
  city: string; // ex: "Yaoundé II"

  @Column({ nullable: true })
  neighborhood: string; // ex: "Bastos"

  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isProfileComplete: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
