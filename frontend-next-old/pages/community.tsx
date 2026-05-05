import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/services/api';

export async function getServerSideProps() {
  const posts = await api<any[]>('/posts');
  return { props: { posts } };
}

export default function CommunityPage({ posts }: { posts: any[] }) {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-semibold">Community</h1>
        <p className="mt-2 text-sm text-gray-300">Posts list (read-only placeholder)</p>
        <div className="mt-4 space-y-3">
          {posts.length === 0 ? (
            <div className="rounded border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
              No posts yet.
            </div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="rounded border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-gray-200">{p.content}</div>
                <div className="mt-2 text-xs text-gray-400">
                  by {p.user?.name ?? 'Unknown'} • participants {p._count?.participants ?? 0} • likes{' '}
                  {p._count?.likes ?? 0}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </AppShell>
  );
}

