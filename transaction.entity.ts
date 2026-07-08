import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { PaymentProviderName } from '../providers/payment-provider.interface';

export type TransactionType = 'listing_boost' | 'subscription';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';

/**
 * Trace tout paiement mobile money (boost d'annonce, abonnement futur, etc.).
 * Le paiement lui-même est délégué à un PaymentProvider (voir providers/),
 * cette table ne fait que suivre l'état de la transaction côté Mboa Connect.
 */
@Entity('transactions')
@Index(['userId'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'listing_id', nullable: true })
  listingId: string | null;

  @Column()
  type: TransactionType;

  @Column('numeric')
  amount: number;

  @Column({ default: 'XAF' })
  currency: string;

  @Column()
  provider: PaymentProviderName;

  // Référence renvoyée par Orange Money / MTN MoMo, utilisée pour réconcilier le webhook.
  @Column({ nullable: true })
  providerReference: string;

  @Column({ default: 'pending' })
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
