import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Listing } from './listing.entity';

@Entity('listing_photos')
export class ListingPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Listing, (listing) => listing.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column({ name: 'listing_id' })
  listingId: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  position: number;
}
