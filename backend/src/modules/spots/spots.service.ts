import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SpotType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchSpotsDto } from './dto/search-spots.dto';

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const v = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(v)));
}

@Injectable()
export class SpotsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: SearchSpotsDto) {
    const where: Prisma.SpotWhereInput = {};
    if (q.type) where.type = q.type as SpotType;
    if (q.district) where.district = { contains: q.district, mode: 'insensitive' };
    if (q.sport) where.sports = { has: q.sport };

    const spots = await this.prisma.spot.findMany({
      where,
      orderBy: q.sort === 'rating' ? { avgRating: 'desc' } : undefined,
      take: 200,
    });

    const lat = q.lat ? Number(q.lat) : undefined;
    const lng = q.lng ? Number(q.lng) : undefined;
    const radiusKm = q.radiusKm ? Number(q.radiusKm) : undefined;

    let enriched = spots.map((s) => ({
      ...s,
      distanceKm: lat != null && lng != null ? haversineKm(lat, lng, s.lat, s.lng) : null,
    }));

    if (radiusKm != null && lat != null && lng != null) {
      enriched = enriched.filter((s) => (s.distanceKm ?? Infinity) <= radiusKm);
    }

    if (q.sort === 'distance' && lat != null && lng != null) {
      enriched.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
    }

    return enriched;
  }

  async detail(id: string) {
    const spot = await this.prisma.spot.findUnique({ where: { id } });
    if (!spot) throw new NotFoundException('Spot not found');
    return spot;
  }

  reviews(spotId: string) {
    return this.prisma.spotReview.findMany({
      where: { spotId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      take: 100,
    });
  }
}

