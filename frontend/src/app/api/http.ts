export type HttpErrorBody = { message?: string };

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

export function getApiBaseUrl() {
  return baseUrl ?? 'http://localhost:4000';
}

export async function http<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (init?.token) headers.set('Authorization', `Bearer ${init.token}`);

  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg =
      (data as HttpErrorBody | null)?.message ??
      (typeof data === 'string' ? data : null) ??
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

