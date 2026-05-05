import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/services/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppShell>
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold">Register</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, name, password }),
              });
              setDone(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Register failed');
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            className="w-full rounded bg-white/10 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />
          <button className="w-full rounded bg-blue-500 px-3 py-2 font-medium text-white hover:bg-blue-400">
            Create account
          </button>
        </form>
        {done ? <p className="mt-3 text-sm text-green-300">Created. Go to /auth/login</p> : null}
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </main>
    </AppShell>
  );
}

