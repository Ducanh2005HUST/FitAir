import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/services/api';

export async function getServerSideProps(ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  if (id === 'demo') return { props: { spot: null, isDemo: true, id } };
  const spot = await api<any>(`/spots/${id}`);
  return { props: { spot, isDemo: false, id } };
}

export default function SpotDetailPage({ spot, isDemo, id }: { spot: any; isDemo: boolean; id: string }) {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl p-6">
        {isDemo ? (
          <>
            <h1 className="text-xl font-semibold">Spot Detail (demo)</h1>
            <p className="mt-2 text-sm text-gray-300">Backend endpoint: GET /spots/:id</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">{spot.name}</h1>
            <p className="mt-2 text-sm text-gray-300">{spot.address}</p>
            <pre className="mt-4 overflow-auto rounded bg-black/40 p-3 text-xs">
              {JSON.stringify({ id, ...spot }, null, 2)}
            </pre>
          </>
        )}
      </main>
    </AppShell>
  );
}

