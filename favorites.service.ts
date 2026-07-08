import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Listing } from '../listings/entities/listing.entity';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private favRepo: Repository<Favorite>,
    @InjectRepository(Listing) private listingsRepo: Repository<Listing>,
    private recommendationsService: RecommendationsService,
  ) {}

  async add(userId: string, listingId: string) {
    const existing = await this.favRepo.findOne({ where: { userId, listingId } });
    if (existing) return existing;
    const fav = this.favRepo.create({ userId, listingId });
    await this.recommendationsService.log(userId, listingId, 'favorite');
    return this.favRepo.save(fav);
  }

  async remove(userId: string, listingId: string) {
    await this.favRepo.delete({ userId, listingId });
    return { success: true };
  }

  /** Renvoie les annonces favorites complètes (pas juste les ids). */
  async findListingsForUser(userId: string) {
    const favorites = await this.favRepo.find({ where: { userId } });
    if (favorites.length === 0) return [];
    const listingIds = favorites.map((f) => f.listingId);
    return this.listingsRepo.find({ where: { id: In(listingIds) } });
  }
}
