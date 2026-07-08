import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import { Favorite } from './entities/favorite.entity';
import { Listing } from '../listings/entities/listing.entity';
import { RecommendationsService } from '../recommendations/recommendations.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favRepo: any;
  let listingsRepo: any;
  let recommendationsService: { log: jest.Mock };

  beforeEach(async () => {
    favRepo = {
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn((x) => Promise.resolve(x)),
      delete: jest.fn(),
      find: jest.fn(),
    };
    listingsRepo = { find: jest.fn() };
    recommendationsService = { log: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: favRepo },
        { provide: getRepositoryToken(Listing), useValue: listingsRepo },
        { provide: RecommendationsService, useValue: recommendationsService },
      ],
    }).compile();

    service = module.get(FavoritesService);
  });

  it('ne crée pas de doublon si le favori existe déjà (idempotence)', async () => {
    favRepo.findOne.mockResolvedValue({ id: 'fav-1' });
    const result = await service.add('user-1', 'listing-1');
    expect(result).toEqual({ id: 'fav-1' });
    expect(favRepo.save).not.toHaveBeenCalled();
  });

  it('crée le favori et journalise l\'interaction pour les recommandations', async () => {
    favRepo.findOne.mockResolvedValue(null);
    await service.add('user-1', 'listing-1');
    expect(recommendationsService.log).toHaveBeenCalledWith('user-1', 'listing-1', 'favorite');
    expect(favRepo.save).toHaveBeenCalled();
  });

  it('renvoie un tableau vide sans interroger les annonces si aucun favori', async () => {
    favRepo.find.mockResolvedValue([]);
    const result = await service.findListingsForUser('user-1');
    expect(result).toEqual([]);
    expect(listingsRepo.find).not.toHaveBeenCalled();
  });
});
