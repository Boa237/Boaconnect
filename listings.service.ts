import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { ListingPhoto } from './entities/listing-photo.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { ListingStatus } from '../common/enums/listing-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing) private listingsRepo: Repository<Listing>,
    @InjectRepository(ListingPhoto) private photosRepo: Repository<ListingPhoto>,
    private notificationsService: NotificationsService,
    private recommendationsService: RecommendationsService,
  ) {}

  /** Liste publique : uniquement les annonces approuvées, avec filtres + pagination. */
  async findApproved(query: QueryListingsDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 50) : 20;

    const where: FindOptionsWhere<Listing> = { status: ListingStatus.APPROVED };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.city) where.city = query.city;
    if (query.neighborhood) where.neighborhood = query.neighborhood;
    if (query.q) where.title = ILike(`%${query.q}%`);
    if (query.minPrice && query.maxPrice) where.price = Between(query.minPrice, query.maxPrice) as any;

    const order: any = { isBoosted: 'DESC', createdAt: 'DESC' };
    if (query.sort === 'price_asc') order.price = 'ASC';
    if (query.sort === 'price_desc') order.price = 'DESC';

    const [items, total] = await this.listingsRepo.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Listing> {
    const listing = await this.listingsRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!listing) throw new NotFoundException('Annonce introuvable.');
    return listing;
  }

  async findOneAndIncrementViews(id: string): Promise<Listing> {
    const listing = await this.findOne(id);
    listing.viewsCount += 1;
    await this.listingsRepo.save(listing);
    return listing;
  }

  /** Journalise une consultation authentifiée pour le moteur de recommandations. */
  async trackAuthenticatedView(id: string, userId: string): Promise<{ tracked: true }> {
    await this.recommendationsService.log(userId, id, 'view');
    return { tracked: true };
  }

  /** Annonces de l'utilisateur connecté, tous statuts confondus. */
  findMine(ownerId: string) {
    return this.listingsRepo.find({ where: { ownerId }, order: { createdAt: 'DESC' } });
  }

  async create(ownerId: string, dto: CreateListingDto): Promise<Listing> {
    const listing = this.listingsRepo.create({
      ...dto,
      ownerId,
      status: ListingStatus.PENDING, // toute nouvelle annonce doit être validée par un admin
    });
    return this.listingsRepo.save(listing);
  }

  /** Associe des photos déjà uploadées (voir UploadsModule) à une annonce. */
  async attachPhotos(listingId: string, ownerId: string, urls: string[]): Promise<Listing> {
    const listing = await this.assertOwnership(listingId, ownerId);
    const startPosition = listing.photos?.length || 0;
    const photos = urls.map((url, i) =>
      this.photosRepo.create({ listingId, url, position: startPosition + i }),
    );
    await this.photosRepo.save(photos);
    return this.findOne(listingId);
  }

  async update(listingId: string, ownerId: string, dto: UpdateListingDto): Promise<Listing> {
    const listing = await this.assertOwnership(listingId, ownerId);
    Object.assign(listing, dto);
    // toute modification repasse l'annonce en attente de modération
    listing.status = ListingStatus.PENDING;
    return this.listingsRepo.save(listing);
  }

  async remove(listingId: string, ownerId: string): Promise<void> {
    const listing = await this.assertOwnership(listingId, ownerId);
    await this.listingsRepo.remove(listing);
  }

  private async assertOwnership(listingId: string, ownerId: string): Promise<Listing> {
    const listing = await this.findOne(listingId);
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenException("Vous ne pouvez modifier que vos propres annonces.");
    }
    return listing;
  }

  // ---------- Utilisé par PaymentsModule après confirmation d'un paiement ----------

  async boost(listingId: string, days: number): Promise<Listing> {
    const listing = await this.findOne(listingId);
    listing.isBoosted = true;
    listing.boostExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return this.listingsRepo.save(listing);
  }

  // ---------- Actions réservées à l'administration (voir AdminModule) ----------

  async adminFindByStatus(status: ListingStatus) {
    return this.listingsRepo.find({ where: { status }, relations: ['owner'], order: { createdAt: 'ASC' } });
  }

  async adminApprove(listingId: string): Promise<Listing> {
    const listing = await this.findOne(listingId);
    listing.status = ListingStatus.APPROVED;
    listing.rejectionReason = null;
    await this.listingsRepo.save(listing);
    await this.notificationsService.notifyListingDecision(listing.ownerId, listing.id, 'approved');
    return listing;
  }

  async adminReject(listingId: string, reason: string): Promise<Listing> {
    const listing = await this.findOne(listingId);
    listing.status = ListingStatus.REJECTED;
    listing.rejectionReason = reason;
    await this.listingsRepo.save(listing);
    await this.notificationsService.notifyListingDecision(listing.ownerId, listing.id, 'rejected', reason);
    return listing;
  }

  async adminRemove(listingId: string): Promise<void> {
    const listing = await this.findOne(listingId);
    await this.listingsRepo.remove(listing);
  }
}
