export type ApiError = { message?: string };

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

export async function api<T>(path: string, init?: RequestInit & { token?: string }) {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (init?.token) headers.set('Authorization', `Bearer ${init.token}`);

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data as ApiError | null)?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

