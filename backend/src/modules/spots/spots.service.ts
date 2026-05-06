import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SpotType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchSpotsDto } from './dto/search-spots.dto';
import { GooglePlacesService } from '../google-places/google-places.service';
import { SerpApiService } from '../serpapi/serpapi.service';

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

function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111; // ~111km per 1 degree lat
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

@Injectable()
export class SpotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googlePlaces: GooglePlacesService,
    private readonly serpApi: SerpApiService,
  ) {}

  async search(q: SearchSpotsDto) {
    const where: Prisma.SpotWhereInput = {};
    if (q.type) where.type = q.type as SpotType;
    if (q.district) where.district = { contains: q.district, mode: 'insensitive' };
    if (q.sport) where.sports = { has: q.sport };

    const lat = q.lat ? Number(q.lat) : undefined;
    const lng = q.lng ? Number(q.lng) : undefined;
    const radiusKm = q.radiusKm ? Number(q.radiusKm) : undefined;
    const radiusKmUsed = lat != null && lng != null ? radiusKm ?? 10 : radiusKm;

    // If caller provides lat/lng, enrich DB with nearby gyms/parks from a provider (SerpApi preferred).
    if (lat != null && lng != null) {
      const now = new Date();
      const box = boundingBox(lat, lng, radiusKmUsed ?? 10);
      const cacheCutoff = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes

      const cachedCount = await this.prisma.spot.count({
        where: {
          source: 'serpapi',
          sourceRefreshedAt: { gt: cacheCutoff },
          lat: { gte: box.minLat, lte: box.maxLat },
          lng: { gte: box.minLng, lte: box.maxLng },
        },
      });

      const shouldFetchSerpApi = cachedCount < 10;

      const serpQueries: string[] =
        q.type === 'outdoor' ? ['park'] : q.type === 'indoor' ? ['gym'] : ['gym', 'park'];

      const serpResults = shouldFetchSerpApi
        ? (
            await Promise.all(
              serpQueries.map((query) =>
                this.serpApi.googleMapsSearch({
                  q: query,
                  lat,
                  lng,
                  zoom: 15,
                  start: 0,
                }),
              ),
            )
          ).flat()
        : [];

      if (serpResults.length) {
        for (const r of serpResults) {
          const id = r.place_id ?? r.data_id ?? r.data_cid;
          const plat = r.gps_coordinates?.latitude;
          const plng = r.gps_coordinates?.longitude;
          if (typeof id !== 'string' || typeof plat !== 'number' || typeof plng !== 'number') continue;

          const name = r.title ?? 'Unknown';
          const address = r.address ?? '';
          const typeStr = `${r.type ?? ''} ${(r.types ?? []).join(' ')}`.toLowerCase();
          const spotType: SpotType = typeStr.includes('park') ? 'outdoor' : 'indoor';
          const imageUrl = r.thumbnail ?? r.serpapi_thumbnail;

          await this.prisma.spot.upsert({
            where: { id },
            update: {
              name,
              address,
              lat: plat,
              lng: plng,
              type: spotType,
              hours: r.hours ?? undefined,
              imageUrls: imageUrl ? [imageUrl] : undefined,
              source: 'serpapi',
              sourceRefreshedAt: now,
            },
            create: {
              id,
              name,
              address,
              lat: plat,
              lng: plng,
              type: spotType,
              hours: r.hours ?? null,
              facilities: [],
              sports: [],
              imageUrls: imageUrl ? [imageUrl] : [],
              source: 'serpapi',
              sourceRefreshedAt: now,
            },
          });
        }
      } else {
        // Fallback to official Google Places if SerpApi isn't configured/available.
        const includedTypes: string[] = [];
        if (q.type === 'indoor') includedTypes.push('gym');
        if (q.type === 'outdoor') includedTypes.push('park');
        if (!includedTypes.length) includedTypes.push('gym', 'park');

        const places = await this.googlePlaces.searchNearby({
          center: { latitude: lat, longitude: lng },
          radiusMeters: Math.max(1000, Math.min(50_000, Math.round((radiusKmUsed ?? 10) * 1000))),
          includedTypes,
          maxResultCount: 20,
        });

        for (const p of places) {
          const name = p.displayName?.text ?? 'Unknown';
          const address = p.formattedAddress ?? '';
          const plat = p.location?.latitude;
          const plng = p.location?.longitude;
          if (typeof plat !== 'number' || typeof plng !== 'number') continue;

          const spotType: SpotType = p.types?.includes('park') ? 'outdoor' : 'indoor';

          await this.prisma.spot.upsert({
            where: { id: p.id },
            update: {
              name,
              address,
              lat: plat,
              lng: plng,
              type: spotType,
              source: 'google',
              sourceRefreshedAt: new Date(),
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
              source: 'google',
              sourceRefreshedAt: new Date(),
            },
          });
        }
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

    if (radiusKmUsed != null && lat != null && lng != null) {
      enriched = enriched.filter((s) => (s.distanceKm ?? Infinity) <= radiusKmUsed);
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
