import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SpotType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchSpotsDto } from './dto/search-spots.dto';
import { GooglePlacesService } from '../google-places/google-places.service';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly googlePlaces: GooglePlacesService,
  ) {}

  async search(q: SearchSpotsDto) {
    const where: Prisma.SpotWhereInput = {};
    if (q.type) where.type = q.type as SpotType;
    if (q.district) where.district = { contains: q.district, mode: 'insensitive' };
    if (q.sport) where.sports = { has: q.sport };

    const lat = q.lat ? Number(q.lat) : undefined;
    const lng = q.lng ? Number(q.lng) : undefined;
    const radiusKm = q.radiusKm ? Number(q.radiusKm) : undefined;

    // If caller provides lat/lng and we have Google Places API key, enrich DB with Google gyms/parks nearby.
    if (lat != null && lng != null) {
      const includedTypes: string[] = [];
      // Map our filters to Google Place types when possible
      if (q.type === 'indoor') includedTypes.push('gym');
      if (q.type === 'outdoor') includedTypes.push('park');
      if (!includedTypes.length) includedTypes.push('gym', 'park');

      const places = await this.googlePlaces.searchNearby({
        center: { latitude: lat, longitude: lng },
        radiusMeters: Math.max(1000, Math.min(50_000, Math.round((radiusKm ?? 10) * 1000))),
        includedTypes,
        maxResultCount: 20,
      });

      for (const p of places) {
        const name = p.displayName?.text ?? 'Unknown';
        const address = p.formattedAddress ?? '';
        const plat = p.location?.latitude;
        const plng = p.location?.longitude;
        if (typeof plat !== 'number' || typeof plng !== 'number') continue;

        const spotType: SpotType =
          p.types?.includes('park') ? 'outdoor' : 'indoor';

        // Upsert into our DB so downstream endpoints (detail/reviews) work.
        await this.prisma.spot.upsert({
          where: { id: p.id },
          update: {
            name,
            address,
            lat: plat,
            lng: plng,
            type: spotType,
          },
          create: {
            id: p.id,
            name,
            address,
            lat: plat,
            lng: plng,
            type: spotType,
            facilities: [],
            sports: [],
            imageUrls: [],
          },
        });
      }
    }

    const spots = await this.prisma.spot.findMany({
      where,
      orderBy: q.sort === 'rating' ? { avgRating: 'desc' } : undefined,
      take: 200,
    });

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
