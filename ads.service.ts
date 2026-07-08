import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Ad, AdPlacement } from './entities/ad.entity';
import { CreateAdDto } from './dto/create-ad.dto';

@Injectable()
export class AdsService {
  constructor(@InjectRepository(Ad) private repo: Repository<Ad>) {}

  /** Renvoie les publicités actives pour un emplacement donné et incrémente les impressions. */
  async findActive(placement: AdPlacement): Promise<Ad[]> {
    const now = new Date();
    const ads = await this.repo.find({
      where: { placement, startsAt: LessThanOrEqual(now), endsAt: MoreThanOrEqual(now) },
      order: { createdAt: 'DESC' },
    });
    if (ads.length > 0) {
      await this.repo.increment({ id: ads[0].id as any }, 'impressions', 1);
    }
    return ads;
  }

  async registerClick(id: string) {
    await this.repo.increment({ id }, 'clicks', 1);
    return { success: true };
  }

  // ---------- Administration ----------

  create(dto: CreateAdDto) {
    const ad = this.repo.create({ ...dto, startsAt: new Date(dto.startsAt), endsAt: new Date(dto.endsAt) });
    return this.repo.save(ad);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
