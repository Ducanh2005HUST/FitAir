import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/services/api';

export async function getServerSideProps() {
  const videos = await api<any[]>('/videos');
  return { props: { videos } };
}

export default function IndoorPage({ videos }: { videos: any[] }) {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-semibold">Indoor Training</h1>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {videos.length === 0 ? (
            <div className="rounded border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
              No videos yet.
            </div>
          ) : (
            videos.map((v) => (
              <Link
                key={v.id}
                href={`/indoor/${v.id}`}
                className="rounded border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <div className="font-medium">{v.titleJp}</div>
                <div className="mt-1 text-xs text-gray-300">{v.category ?? 'General'}</div>
              </Link>
            ))
          )}
        </div>
      </main>
    </AppShell>
  );
}

