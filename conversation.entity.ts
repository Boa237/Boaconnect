import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Conversation entre deux utilisateurs, généralement démarrée à propos d'une
 * annonce précise. Évite d'exposer systématiquement les numéros de téléphone.
 */
@Entity('conversations')
@Index(['participantOneId', 'participantTwoId'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'participant_one_id' })
  participantOneId: string;

  @Column({ name: 'participant_two_id' })
  participantTwoId: string;

  @Column({ name: 'listing_id', nullable: true })
  listingId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
