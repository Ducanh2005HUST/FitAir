import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SerpApiService } from '../serpapi/serpapi.service';

@Injectable()
export class IndoorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly serpApi: SerpApiService,
  ) {}

  private youtubeApiKey() {
    const raw = this.config.get<string>('YOUTUBE_API_KEY') ?? '';
    const trimmed = raw.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  list(input?: { category?: string; take?: number; skip?: number }) {
    const take = input?.take != null ? Math.max(1, Math.min(100, Math.floor(input.take))) : 40;
    const skip = input?.skip != null ? Math.max(0, Math.floor(input.skip)) : 0;
    return this.prisma.indoorVideo.findMany({
      where: input?.category && input.category !== 'all' ? { category: input.category } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  private async youtubeSearchRaw(input: {
    query: string;
    maxResults?: number;
    pageToken?: string;
    order?: 'date' | 'relevance';
  }): Promise<{ items: any[]; nextPageToken?: string }> {
    const key = this.youtubeApiKey();
    if (!key) return { items: [] };
    const query = (input.query ?? '').trim();
    if (!query) return { items: [] };

    const maxResults = Number.isFinite(input.maxResults)
      ? Math.max(1, Math.min(25, Math.floor(input.maxResults as number)))
      : 12;

    const params = new URLSearchParams();
    params.set('part', 'snippet');
    params.set('type', 'video');
    params.set('q', query);
    params.set('maxResults', String(maxResults));
    params.set('key', key);
    params.set('safeSearch', 'moderate');
    params.set('videoEmbeddable', 'true');
    params.set('videoSyndicated', 'true');
    params.set('order', input.order ?? 'relevance');
    params.set('relevanceLanguage', 'ja');
    params.set('regionCode', 'JP');
    if (input.pageToken) params.set('pageToken', input.pageToken);

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
        method: 'GET',
        signal: ctrl.signal,
      });
      const data = (await res.json()) as any;
      if (!res.ok || typeof data?.error?.message === 'string') {
        // eslint-disable-next-line no-console
        console.warn('[YouTube] search failed', res.status, data?.error?.message ?? data);
        return { items: [] };
      }

      const items = Array.isArray(data?.items) ? data.items : [];
      const mapped = items
        .map((it: any) => {
          const videoId = it?.id?.videoId;
          const title = it?.snippet?.title;
          const channelTitle = it?.snippet?.channelTitle;
          const publishedAt = it?.snippet?.publishedAt;
          const thumb =
            it?.snippet?.thumbnails?.medium?.url ??
            it?.snippet?.thumbnails?.high?.url ??
            it?.snippet?.thumbnails?.default?.url;
          if (typeof videoId !== 'string' || !videoId) return null;
          return {
            id: videoId,
            title: typeof title === 'string' ? title : '',
            channelTitle: typeof channelTitle === 'string' ? channelTitle : '',
            thumbnailUrl: typeof thumb === 'string' ? thumb : '',
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            publishedAt: typeof publishedAt === 'string' ? publishedAt : undefined,
          };
        })
        .filter(Boolean);
      const nextPageToken = typeof data?.nextPageToken === 'string' ? data.nextPageToken : undefined;
      return { items: mapped, nextPageToken };
    } catch {
      return { items: [] };
    } finally {
      clearTimeout(t);
    }
  }

  async youtubeSearch(input: { query: string; maxResults?: number; pageToken?: string; order?: 'date' | 'relevance' }) {
    const out = await this.youtubeSearchRaw(input);
    return out.items;
  }

  async syncFromYoutube(input: { category?: string; max?: number }) {
    const category = (input.category ?? 'all').trim();
    const max = input.max != null ? Math.max(1, Math.min(50, Math.floor(input.max))) : 40;

    const queriesByCategory: Record<string, string[]> = {
      yoga: ['ヨガ 初心者', 'ヨガ 全身 ストレッチ'],
      stretch: ['ストレッチ 全身 10分', '柔軟体操 体が硬い'],
      cardio: ['有酸素運動 自宅 20分', '脂肪燃焼 有酸素 初心者'],
      strength: ['筋トレ 自重 全身', '筋トレ 自宅 初心者'],
      all: ['自宅トレーニング 初心者 全身'],
    };

    const categories =
      category === 'all' ? ['yoga', 'stretch', 'cardio', 'strength'] : [category];

    const results: { category: string; created: number; updated: number; fetched: number }[] = [];

    for (const c of categories) {
      const queries = queriesByCategory[c] ?? queriesByCategory.all;
      const fetched: { videoId: string; title: string; channelTitle?: string; thumbnailUrl?: string; youtubeUrl: string; publishedAt?: string; length?: string }[] = [];

      if (this.serpApi.hasApiKey()) {
        // Use SerpApi YouTube engine. For newest uploads, SerpApi uses `sp=CAI%3D`.
        for (const query of queries) {
          let sp: string | undefined = 'CAI%3D';
          while (fetched.length < max) {
            const out = await this.serpApi.youtubeSearch({
              searchQuery: query,
              sp,
              noCache: true,
              hl: 'ja',
              gl: 'jp',
            });
            if (!out.items.length) break;
            for (const it of out.items) {
              fetched.push({
                videoId: it.videoId,
                title: it.title,
                channelTitle: it.channelName,
                thumbnailUrl: it.thumbnailUrl,
                youtubeUrl: it.link,
              });
              if (fetched.length >= max) break;
            }
            if (!out.nextPageToken) break;
            sp = out.nextPageToken;
          }
          if (fetched.length >= max) break;
        }
      } else {
        // Fallback: official YouTube Data API
        const key = this.youtubeApiKey();
        if (!key) return { ok: false, reason: 'YOUTUBE_API_KEY or SERPAPI_API_KEY not set' } as const;

        for (const query of queries) {
          let pageToken: string | undefined;
          while (fetched.length < max) {
            const out = await this.youtubeSearchRaw({
              query,
              maxResults: Math.min(25, max - fetched.length),
              pageToken,
              order: 'date',
            });
            if (!out.items.length) break;
            for (const it of out.items) {
              fetched.push({
                videoId: it.id,
                title: it.title,
                channelTitle: it.channelTitle,
                thumbnailUrl: it.thumbnailUrl,
                youtubeUrl: it.youtubeUrl,
                publishedAt: it.publishedAt,
              });
              if (fetched.length >= max) break;
            }
            if (!out.nextPageToken) break;
            pageToken = out.nextPageToken;
          }
          if (fetched.length >= max) break;
        }
      }

      // Upsert into DB
      let created = 0;
      let updated = 0;
      for (const v of fetched.slice(0, max)) {
        const id = `yt-${v.videoId}`;
        const existing = await this.prisma.indoorVideo.findUnique({ where: { id } });
        if (existing) {
          await this.prisma.indoorVideo.update({
            where: { id },
            data: {
              titleJp: v.title || existing.titleJp,
              youtubeUrl: v.youtubeUrl,
              category: c,
              instructor: v.channelTitle || existing.instructor,
              duration: v.length ?? existing.duration,
              description: v.publishedAt ? `publishedAt:${v.publishedAt}` : existing.description,
            },
          });
          updated += 1;
        } else {
          await this.prisma.indoorVideo.create({
            data: {
              id,
              titleJp: v.title || 'YouTube',
              titleVn: null,
              youtubeUrl: v.youtubeUrl,
              category: c,
              instructor: v.channelTitle || null,
              duration: v.length ?? null,
              level: null,
              calories: null,
              description: v.publishedAt ? `publishedAt:${v.publishedAt}` : null,
            },
          });
          created += 1;
        }
      }

      results.push({ category: c, created, updated, fetched: fetched.length });
    }

    return { ok: true, results } as const;
  }

  async detail(id: string) {
    const v = await this.prisma.indoorVideo.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Video not found');
    return v;
  }
}
