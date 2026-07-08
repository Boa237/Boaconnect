import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Listing } from '../listings/entities/listing.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Listing]), RecommendationsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
