import { Injectable } from '@nestjs/common';
import { ListingsService } from '../listings/listings.service';
import { ListingStatus } from '../common/enums/listing-status.enum';

@Injectable()
export class AdminService {
  constructor(private listingsService: ListingsService) {}

  getPendingListings() {
    return this.listingsService.adminFindByStatus(ListingStatus.PENDING);
  }

  getApprovedListings() {
    return this.listingsService.adminFindByStatus(ListingStatus.APPROVED);
  }

  approve(listingId: string) {
    return this.listingsService.adminApprove(listingId);
  }

  reject(listingId: string, reason: string) {
    return this.listingsService.adminReject(listingId, reason);
  }

  remove(listingId: string) {
    return this.listingsService.adminRemove(listingId);
  }
}
