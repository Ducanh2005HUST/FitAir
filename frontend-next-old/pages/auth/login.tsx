import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@fitair.local');
  const [password, setPassword] = useState('password123');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppShell>
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              const out = await api<{ token: string }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
              });
              setToken(out.token);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Login failed');
            }
          }}
        >
          <input
            className="w-full rounded bg-white/10 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="w-full rounded bg-white/10 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />
          <button className="w-full rounded bg-blue-500 px-3 py-2 font-medium text-white hover:bg-blue-400">
            Sign in
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        {token ? <p className="mt-3 break-all text-xs text-green-300">Token: {token}</p> : null}
        <p className="mt-4 text-xs text-gray-300">Register: /auth/register</p>
      </main>
    </AppShell>
  );
}

