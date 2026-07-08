import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type AdPlacement = 'home_banner' | 'category_top' | 'search_top';

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'advertiser_id', nullable: true })
  advertiserId: string | null;

  @Column({ name: 'listing_id', nullable: true })
  listingId: string | null;

  @Column()
  placement: AdPlacement;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  targetUrl: string;

  @Column({ type: 'timestamptz' })
  startsAt: Date;

  @Column({ type: 'timestamptz' })
  endsAt: Date;

  @Column('numeric', { nullable: true })
  budget: number | null;

  @Column({ default: 0 })
  impressions: number;

  @Column({ default: 0 })
  clicks: number;

  @CreateDateColumn()
  createdAt: Date;
}
