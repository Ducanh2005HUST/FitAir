import { AppShell } from '@/components/layout/AppShell';

export default function ReviewFormPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Write a Review</h1>
        <div className="mt-4 rounded border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
          Placeholder. Next step: POST `/spots/:id/reviews` with JWT token.
        </div>
      </main>
    </AppShell>
  );
}

