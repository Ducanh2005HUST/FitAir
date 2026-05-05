import { AppShell } from '@/components/layout/AppShell';

export default function ChangePasswordPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-semibold">Change Password</h1>
        <div className="mt-4 rounded border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
          Placeholder. Next step: POST `/auth/change-password` (requires auth).
        </div>
      </main>
    </AppShell>
  );
}

