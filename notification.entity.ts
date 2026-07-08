import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

export type NotificationType =
  | 'new_listing'
  | 'listing_approved'
  | 'listing_rejected'
  | 'favorite_price_drop'
  | 'system';

@Entity('notifications')
@Index(['userId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ nullable: true, name: 'listing_id' })
  listingId: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
