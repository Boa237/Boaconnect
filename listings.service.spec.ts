import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { Listing } from './entities/listing.entity';
import { ListingPhoto } from './entities/listing-photo.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { ListingStatus } from '../common/enums/listing-status.enum';

describe('ListingsService', () => {
  let service: ListingsService;
  let listingsRepo: any;
  let photosRepo: any;

  const sampleListing = {
    id: 'listing-1',
    ownerId: 'owner-1',
    status: ListingStatus.APPROVED,
    viewsCount: 0,
    photos: [],
  };

  beforeEach(async () => {
    listingsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn((x) => Promise.resolve(x)),
      remove: jest.fn(),
    };
    photosRepo = { create: jest.fn((x) => x), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: getRepositoryToken(Listing), useValue: listingsRepo },
        { provide: getRepositoryToken(ListingPhoto), useValue: photosRepo },
        { provide: NotificationsService, useValue: { notifyListingDecision: jest.fn() } },
        { provide: RecommendationsService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get(ListingsService);
  });

  describe('findOne', () => {
    it("lève une NotFoundException si l'annonce n'existe pas", async () => {
      listingsRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it("crée toujours une annonce avec le statut 'pending', quel que soit le payload", async () => {
      const dto = { categoryId: 'cat-1', title: 'Titre valide', description: 'Description assez longue', city: 'Yaoundé II', neighborhood: 'Bastos' } as any;
      const result = await service.create('owner-1', dto);
      expect(result.status).toBe(ListingStatus.PENDING);
      expect(result.ownerId).toBe('owner-1');
    });
  });

  describe('update (règle de propriété)', () => {
    it("refuse la modification si l'utilisateur n'est pas le propriétaire", async () => {
      listingsRepo.findOne.mockResolvedValue({ ...sampleListing, ownerId: 'someone-else' });
      await expect(service.update('listing-1', 'owner-1', { title: 'Nouveau titre' } as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('autorise la modification par le propriétaire et repasse l\'annonce en attente', async () => {
      listingsRepo.findOne.mockResolvedValue({ ...sampleListing, ownerId: 'owner-1', status: ListingStatus.APPROVED });
      const result = await service.update('listing-1', 'owner-1', { title: 'Nouveau titre' } as any);
      expect(result.status).toBe(ListingStatus.PENDING);
    });
  });

  describe('remove (règle de propriété)', () => {
    it('refuse la suppression par un non-propriétaire', async () => {
      listingsRepo.findOne.mockResolvedValue({ ...sampleListing, ownerId: 'owner-1' });
      await expect(service.remove('listing-1', 'intrus')).rejects.toThrow(ForbiddenException);
      expect(listingsRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('boost', () => {
    it("marque l'annonce comme boostée avec une date d'expiration future", async () => {
      listingsRepo.findOne.mockResolvedValue({ ...sampleListing });
      const result = await service.boost('listing-1', 7);
      expect(result.isBoosted).toBe(true);
      expect(result.boostExpiresAt).not.toBeNull();
      expect(result.boostExpiresAt!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('adminApprove / adminReject', () => {
    it('approuve une annonce et notifie le propriétaire', async () => {
      listingsRepo.findOne.mockResolvedValue({ ...sampleListing, status: ListingStatus.PENDING });
      const result = await service.adminApprove('listing-1');
      expect(result.status).toBe(ListingStatus.APPROVED);
      expect(result.rejectionReason).toBeNull();
    });

    it('rejette une annonce avec un motif et notifie le propriétaire', async () => {
      listingsRepo.findOne.mockResolvedValue({ ...sampleListing, status: ListingStatus.PENDING });
      const result = await service.adminReject('listing-1', 'Photos non conformes');
      expect(result.status).toBe(ListingStatus.REJECTED);
      expect(result.rejectionReason).toBe('Photos non conformes');
    });
  });
});
