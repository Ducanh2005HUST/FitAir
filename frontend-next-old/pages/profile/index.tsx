import { AppShell } from '@/components/layout/AppShell';

export default function ProfilePage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-semibold">Profile</h1>
        <div className="mt-4 rounded border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
          Profile placeholder. Next step: token storage + call `/users/me`.
        </div>
      </main>
    </AppShell>
  );
}

