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

  hasApiKey() {
    return Boolean(this.apiKey());
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

  async youtubeSearch(input: {
    searchQuery: string;
    sp?: string; // pagination/filter token
    hl?: string;
    gl?: string;
    noCache?: boolean;
  }): Promise<{ items: { videoId: string; title: string; channelName?: string; length?: string; thumbnailUrl?: string; link: string }[]; nextPageToken?: string }> {
    const key = this.apiKey();
    if (!key) return { items: [] };

    const q = (input.searchQuery ?? '').trim();
    if (!q) return { items: [] };

    const params = new URLSearchParams();
    params.set('engine', 'youtube');
    params.set('search_query', q);
    params.set('api_key', key);
    params.set('hl', input.hl ?? 'en');
    params.set('gl', input.gl ?? 'us');
    if (input.sp) params.set('sp', input.sp);
    if (input.noCache ?? true) params.set('no_cache', 'true');

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const url = `https://serpapi.com/search.json?${params.toString()}`;
      const res = await fetch(url, { method: 'GET', signal: ctrl.signal });
      const data = (await res.json()) as any;
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.warn('[SerpApi:YouTube] non-200 response', res.status, data?.error ?? data);
        return { items: [] };
      }
      if (typeof data?.error === 'string' && data.error.length) {
        // eslint-disable-next-line no-console
        console.warn('[SerpApi:YouTube] error', data.error);
        return { items: [] };
      }

      const videoResults = Array.isArray(data?.video_results) ? data.video_results : [];
      const items = videoResults
        .map((r: any) => {
          const videoId = r?.video_id;
          const title = r?.title;
          const link = r?.link;
          const channelName = r?.channel?.name;
          const length = r?.length;
          const thumbnailUrl = r?.thumbnail?.static ?? r?.thumbnail;
          if (typeof videoId !== 'string' || !videoId) return null;
          return {
            videoId,
            title: typeof title === 'string' ? title : '',
            channelName: typeof channelName === 'string' ? channelName : undefined,
            length: typeof length === 'string' ? length : undefined,
            thumbnailUrl: typeof thumbnailUrl === 'string' ? thumbnailUrl : undefined,
            link: typeof link === 'string' ? link : `https://www.youtube.com/watch?v=${videoId}`,
          };
        })
        .filter(Boolean);

      const nextPageToken =
        (typeof data?.pagination?.next_page_token === 'string' ? data.pagination.next_page_token : undefined) ??
        (typeof data?.serpapi_pagination?.next_page_token === 'string' ? data.serpapi_pagination.next_page_token : undefined);

      return { items, nextPageToken };
    } catch {
      return { items: [] };
    } finally {
      clearTimeout(t);
    }
  }
}
