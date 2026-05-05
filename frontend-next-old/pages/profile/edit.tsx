import { AppShell } from '@/components/layout/AppShell';

export default function EditProfilePage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-semibold">Edit Profile</h1>
        <div className="mt-4 rounded border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
          Placeholder. Next step: PUT `/users/me` (requires auth).
        </div>
      </main>
    </AppShell>
  );
}

