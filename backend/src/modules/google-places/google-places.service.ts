import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type LatLng = { latitude: number; longitude: number };

type GooglePlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
};

@Injectable()
export class GooglePlacesService {
  constructor(private readonly config: ConfigService) {}

  private apiKey() {
    return this.config.get<string>('GOOGLE_MAPS_API_KEY') ?? '';
  }

  async searchNearby(input: {
    center: LatLng;
    radiusMeters: number;
    includedTypes: string[];
    maxResultCount?: number;
  }): Promise<GooglePlace[]> {
    const key = this.apiKey();
    if (!key) return [];

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount',
        },
        body: JSON.stringify({
          includedTypes: input.includedTypes,
          maxResultCount: input.maxResultCount ?? 20,
          locationRestriction: {
            circle: {
              center: input.center,
              radius: input.radiusMeters,
            },
          },
        }),
      });

      const data = (await res.json()) as any;
      const places = Array.isArray(data?.places) ? (data.places as GooglePlace[]) : [];
      return places.filter((p) => typeof p?.id === 'string' && p.id.length > 0);
    } catch {
      return [];
    } finally {
      clearTimeout(t);
    }
  }
}

