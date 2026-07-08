import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { ListingPhoto } from './entities/listing-photo.entity';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, ListingPhoto]), NotificationsModule, RecommendationsModule],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
