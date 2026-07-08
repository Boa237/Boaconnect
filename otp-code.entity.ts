import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Codes OTP à usage unique envoyés par SMS pour prouver la possession
 * d'un numéro de téléphone, à l'inscription comme à la connexion.
 */
@Entity('otp_codes')
export class OtpCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  // On ne stocke jamais le code en clair, uniquement son hash bcrypt.
  @Column()
  codeHash: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
