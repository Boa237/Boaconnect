import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('favorites')
@Index(['userId', 'listingId'], { unique: true })
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'listing_id' })
  listingId: string;

  @CreateDateColumn()
  createdAt: Date;
}
