import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SerpApiLocalResult = {
  title?: string;
  place_id?: string;
  data_id?: string;
  data_cid?: string;
  type?: string;
  types?: string[];
  rating?: number;
  reviews?: number;
  address?: string;
  hours?: string;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  gps_coordinates?: { latitude?: number; longitude?: number };
};

@Injectable()
export class SerpApiService {
  constructor(private readonly config: ConfigService) {}

  private apiKey() {
    const raw = this.config.get<string>('SERPAPI_API_KEY') ?? '';
    const trimmed = raw.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  async googleMapsSearch(input: {
    q: string;
    lat: number;
    lng: number;
    zoom?: number;
    start?: number;
  }): Promise<SerpApiLocalResult[]> {
    const key = this.apiKey();
    if (!key) return [];

    const zoom = input.zoom ?? 15;
    const ll = `@${input.lat},${input.lng},${zoom}z`;

    const params = new URLSearchParams();
    params.set('engine', 'google_maps');
    params.set('type', 'search');
    params.set('q', input.q);
    params.set('ll', ll);
    params.set('api_key', key);
    params.set('hl', 'en');
    if (typeof input.start === 'number' && input.start > 0) {
      params.set('start', String(input.start));
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const url = `https://serpapi.com/search.json?${params.toString()}`;
      const res = await fetch(url, {
        method: 'GET',
        signal: ctrl.signal,
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        // SerpApi often returns a JSON body with `error` on 4xx/5xx.
        // Keep API stable (return []), but log enough to debug env/config issues.
        // eslint-disable-next-line no-console
        console.warn('[SerpApi] non-200 response', res.status, data?.error ?? data);
        return [];
      }
      if (typeof data?.error === 'string' && data.error.length) {
        // eslint-disable-next-line no-console
        console.warn('[SerpApi] error', data.error);
        return [];
      }

      const localResults = Array.isArray(data?.local_results)
        ? (data.local_results as SerpApiLocalResult[])
        : [];

      return localResults.filter((r) => {
        const id = r.place_id ?? r.data_id ?? r.data_cid;
        return typeof id === 'string' && id.length > 0;
      });
    } catch {
      return [];
    } finally {
      clearTimeout(t);
    }
  }
}
