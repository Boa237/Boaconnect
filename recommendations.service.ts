import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserInteraction, InteractionAction } from './entities/user-interaction.entity';
import { Listing } from '../listings/entities/listing.entity';
import { ListingStatus } from '../common/enums/listing-status.enum';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(UserInteraction) private interactionsRepo: Repository<UserInteraction>,
    @InjectRepository(Listing) private listingsRepo: Repository<Listing>,
  ) {}

  log(userId: string | null, listingId: string, action: InteractionAction) {
    return this.interactionsRepo.save(this.interactionsRepo.create({ userId, listingId, action }));
  }

  /**
   * Recommandation à base de règles (v1) :
   * 1. Regarde les catégories/quartiers les plus consultés ou favorisés par l'utilisateur.
   * 2. Propose des annonces approuvées dans ces mêmes catégories/quartiers,
   *    non encore vues, triées par récence puis popularité.
   * 3. À défaut d'historique, renvoie les annonces les plus populaires du moment.
   *
   * Ce contrat (même signature, même forme de retour) restera valable si l'on
   * remplace un jour cette logique par un vrai modèle de collaborative filtering
   * entraîné sur la table user_interactions.
   */
  async getRecommendationsForUser(userId: string, limit = 10): Promise<Listing[]> {
    const interactions = await this.interactionsRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 50 });
    const viewedListingIds = interactions.map((i) => i.listingId);

    if (interactions.length === 0) {
      return this.listingsRepo.find({
        where: { status: ListingStatus.APPROVED },
        order: { isBoosted: 'DESC', viewsCount: 'DESC', createdAt: 'DESC' } as any,
        take: limit,
      });
    }

    const interactedListings = await this.listingsRepo.find({ where: { id: In(viewedListingIds) } });
    const categoryIds = [...new Set(interactedListings.map((l) => l.categoryId))];
    const cities = [...new Set(interactedListings.map((l) => l.city))];

    const query = this.listingsRepo
      .createQueryBuilder('listing')
      .where('listing.status = :status', { status: ListingStatus.APPROVED })
      .andWhere(viewedListingIds.length ? 'listing.id NOT IN (:...viewedListingIds)' : '1=1', { viewedListingIds })
      .andWhere('(listing.category_id IN (:...categoryIds) OR listing.city IN (:...cities))', {
        categoryIds: categoryIds.length ? categoryIds : [''],
        cities: cities.length ? cities : [''],
      })
      .orderBy('listing.isBoosted', 'DESC')
      .addOrderBy('listing.viewsCount', 'DESC')
      .addOrderBy('listing.createdAt', 'DESC')
      .take(limit);

    const results = await query.getMany();

    // Complète avec des annonces populaires si pas assez de résultats pertinents.
    if (results.length < limit) {
      const fallback = await this.listingsRepo.find({
        where: { status: ListingStatus.APPROVED },
        order: { viewsCount: 'DESC' } as any,
        take: limit - results.length,
      });
      const existingIds = new Set(results.map((r) => r.id));
      for (const listing of fallback) {
        if (!existingIds.has(listing.id)) results.push(listing);
      }
    }

    return results;
  }
}
