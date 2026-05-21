export type HttpErrorBody = { message?: string };

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

export function getApiBaseUrl() {
  return baseUrl ?? 'http://localhost:4000';
}

type CacheEntry = { at: number; data: unknown };
const getCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60_000;

export class HttpError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export async function http<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (init?.token) headers.set('Authorization', `Bearer ${init.token}`);

  const method = (init?.method ?? 'GET').toUpperCase();
  const url = `${getApiBaseUrl()}${path}`;

  const cacheKey = init?.token ? `${url}::token:${init.token}` : url;
  const canCache =
    method === 'GET' &&
    !path.startsWith('/notifications') &&
    !path.startsWith('/push') &&
    !path.startsWith('/auth');

  if (canCache) {
    const cached = getCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg =
      (data as HttpErrorBody | null)?.message ??
      (typeof data === 'string' ? data : null) ??
      `HTTP ${res.status}`;
    throw new HttpError(msg, res.status, data);
  }

  if (canCache) {
    getCache.set(cacheKey, { at: Date.now(), data });
  }

  return data as T;
}
