import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/services/api';

export async function getServerSideProps(ctx: { params: { id: string } }) {
  const v = await api<any>(`/videos/${ctx.params.id}`);
  return { props: { v } };
}

export default function IndoorDetailPage({ v }: { v: any }) {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">{v.titleJp}</h1>
        <p className="mt-2 text-sm text-gray-300">{v.description ?? ''}</p>
        <div className="mt-4 aspect-video overflow-hidden rounded bg-black/40">
          <iframe
            className="h-full w-full"
            src={toYoutubeEmbed(v.youtubeUrl)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </main>
    </AppShell>
  );
}

function toYoutubeEmbed(url: string) {
  try {
    const u = new URL(url);
    const id = u.searchParams.get('v') ?? u.pathname.split('/').filter(Boolean).pop() ?? '';
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return url;
  }
}

