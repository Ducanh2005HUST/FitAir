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
        const titleJp = ensureJapaneseTitle({
          rawTitle: v.title,
          category: c,
          duration: v.length ?? existing?.duration ?? null,
          channelTitle: v.channelTitle ?? existing?.instructor ?? null,
          seed: id,
        });
        if (existing) {
          await this.prisma.indoorVideo.update({
            where: { id },
            data: {
              titleJp,
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
              titleJp,
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

  async normalizeJapaneseTitles() {
    const rows = await this.prisma.indoorVideo.findMany({
      select: { id: true, titleJp: true, category: true, duration: true, instructor: true },
      take: 5000,
    });
    let updated = 0;
    for (const r of rows) {
      const next = ensureJapaneseTitle({
        rawTitle: r.titleJp,
        category: r.category,
        duration: r.duration ?? null,
        channelTitle: r.instructor ?? null,
        seed: r.id,
      });
      if (next !== r.titleJp) {
        await this.prisma.indoorVideo.update({ where: { id: r.id }, data: { titleJp: next } });
        updated += 1;
      }
    }
    return { ok: true, updated };
  }
}

function hasJapanese(text: string) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(text);
}

function decodeHtmlEntities(s: string) {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function categoryLabel(category: string | null) {
  if (category === 'yoga') return 'ヨガ';
  if (category === 'stretch') return 'ストレッチ';
  if (category === 'cardio') return '有酸素';
  if (category === 'strength') return '筋トレ';
  return '室内トレーニング';
}

function stableIndex(seed: string, size: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return size > 0 ? hash % size : 0;
}

function durationToMinutes(duration: string | null) {
  if (!duration) return null;
  const raw = duration.trim();
  const plainMin = /^(\d{1,3})\s*(min|mins|minute|minutes)$/i.exec(raw);
  if (plainMin) {
    const mm = Number(plainMin[1]);
    return Number.isFinite(mm) && mm > 0 ? mm : null;
  }

  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  if (!m) return null;
  if (m[3]) {
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    const ss = Number(m[3]);
    if (![hh, mm, ss].every(Number.isFinite)) return null;
    return Math.max(1, Math.round(hh * 60 + mm + (ss >= 30 ? 1 : 0)));
  }
  const mm = Number(m[1]);
  const ss = Number(m[2]);
  if (![mm, ss].every(Number.isFinite)) return null;
  return Math.max(1, Math.round(mm + (ss >= 30 ? 1 : 0)));
}

function generatedJapaneseTitle(input: { rawTitle: string; category: string | null; duration: string | null; seed: string }) {
  const raw = decodeHtmlEntities(String(input.rawTitle ?? '')).replace(/\s+/g, ' ').trim();
  const minutes = durationToMinutes(input.duration);
  const lower = raw.toLowerCase();
  const prefix = minutes ? `${minutes}分 ` : '';

  const yoga = [
    '朝のやさしいヨガ',
    '初心者向け全身ヨガ',
    'リラックスヨガ',
    '姿勢を整えるヨガ',
    '疲れを癒す夜ヨガ',
    '肩こり改善ヨガ',
    '柔軟性アップヨガ',
    '呼吸を整えるヨガ',
    '体幹を鍛えるヨガ',
    '代謝アップヨガ',
    '寝る前のリセットヨガ',
    '全身をほぐすヨガ',
  ];
  const stretch = [
    '朝の全身ストレッチ',
    '首と肩のストレッチ',
    '腰まわりストレッチ',
    '股関節ストレッチ',
    '寝る前のリラックスストレッチ',
    '柔軟性アップストレッチ',
    '背中をほぐすストレッチ',
    '脚の疲れを取るストレッチ',
    '姿勢改善ストレッチ',
    'デスクワーク後のストレッチ',
    '全身リセットストレッチ',
    '初心者向けストレッチ',
  ];
  const cardio = [
    '自宅で有酸素運動',
    '脂肪燃焼カーディオ',
    '低負荷カーディオ',
    '初心者向け有酸素',
    '汗をかく全身運動',
    '音楽に合わせる有酸素',
    '短時間カーディオ',
    '代謝アップ有酸素',
    'ジャンプなし有酸素',
    '朝のカーディオ',
    '全身引き締め有酸素',
    '室内ウォーキング',
  ];
  const strength = [
    '自重で全身筋トレ',
    '初心者向け筋トレ',
    '腹筋集中トレーニング',
    '下半身トレーニング',
    '体幹強化トレーニング',
    '腕と肩の筋トレ',
    'お尻を鍛える筋トレ',
    '短時間全身筋トレ',
    '器具なし筋トレ',
    '姿勢改善筋トレ',
    '代謝アップ筋トレ',
    '引き締めトレーニング',
  ];
  const general = [
    '室内トレーニング',
    '初心者向けホームワークアウト',
    '全身リフレッシュ運動',
    '短時間フィットネス',
    '自宅でできる運動',
    '毎日の軽い運動',
  ];

  let titles = general;
  if (input.category === 'yoga') titles = yoga;
  if (input.category === 'stretch') titles = stretch;
  if (input.category === 'cardio') titles = cardio;
  if (input.category === 'strength') titles = strength;

  let base = titles[stableIndex(`${input.seed}:${raw}`, titles.length)];
  if (lower.includes('morning') || lower.includes('朝')) base = input.category === 'stretch' ? '朝の全身ストレッチ' : '朝のやさしいヨガ';
  if (lower.includes('beginner') || lower.includes('初心者')) base = `${categoryLabel(input.category)}初心者メニュー`;
  if (lower.includes('full body') || lower.includes('全身')) base = `全身${categoryLabel(input.category)}メニュー`;
  if (lower.includes('hiit')) base = '脂肪燃焼HIIT';
  if (lower.includes('abs') || lower.includes('core') || lower.includes('腹')) base = '腹筋集中トレーニング';

  return `${prefix}${base}`.trim();
}

function ensureJapaneseTitle(input: { rawTitle: string; category: string | null; duration: string | null; channelTitle: string | null; seed?: string }) {
  return generatedJapaneseTitle({
    rawTitle: input.rawTitle,
    category: input.category,
    duration: input.duration,
    seed: input.seed ?? input.rawTitle,
  });
}
