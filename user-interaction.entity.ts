import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type InteractionAction = 'view' | 'favorite' | 'contact_click';

/**
 * Journal des interactions utilisateur, base d'apprentissage pour les
 * recommandations. Le moteur actuel est à base de règles (voir
 * RecommendationsService) ; cette table est conçue pour pouvoir alimenter
 * un vrai modèle de collaborative filtering plus tard sans changer le
 * contrat de l'API (GET /listings/recommended reste identique).
 */
@Entity('user_interactions')
@Index(['userId'])
@Index(['listingId'])
export class UserInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @Column({ name: 'listing_id' })
  listingId: string;

  @Column()
  action: InteractionAction;

  @CreateDateColumn()
  createdAt: Date;
}
