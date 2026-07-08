import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { ListingPhoto } from './listing-photo.entity';
import { ListingStatus } from '../../common/enums/listing-status.enum';

@Entity('listings')
@Index(['status', 'categoryId'])
@Index(['city'])
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('numeric', { nullable: true })
  price: number | null;

  @Column({ default: 'on_request' })
  priceUnit: 'total' | 'per_month' | 'per_night' | 'on_request';

  @Column({ default: 'XAF' })
  currency: string;

  @Column()
  city: string; // ex: "Yaoundé II"

  @Column()
  neighborhood: string; // ex: "Bastos"

  // Géolocalisation du bien — utilisée pour l'affichage sur la carte
  // (Google Maps côté mobile, ou tuiles OpenStreetMap).
  @Column('double precision', { nullable: true })
  latitude: number | null;

  @Column('double precision', { nullable: true })
  longitude: number | null;

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.PENDING })
  status: ListingStatus;

  @Column({ nullable: true })
  rejectionReason: string | null;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ default: 0 })
  viewsCount: number;

  // Champs utilisés par le module Payments : une annonce "boostée" est mise
  // en avant (tri prioritaire) jusqu'à boostExpiresAt.
  @Column({ default: false })
  isBoosted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  boostExpiresAt: Date | null;

  @OneToMany(() => ListingPhoto, (photo) => photo.listing, { cascade: true, eager: true })
  photos: ListingPhoto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
