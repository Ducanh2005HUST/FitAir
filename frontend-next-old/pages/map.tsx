import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/services/api';

export async function getServerSideProps() {
  const aqi = await api<{ aqi: number; category: string; updatedAt: string }>('/environment/aqi');
  return { props: { aqi } };
}

export default function MapPage({ aqi }: { aqi: { aqi: number; category: string; updatedAt: string } }) {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-semibold">Search & Map</h1>
        <p className="mt-2 text-sm text-gray-300">
          AQI hiện tại (mock): <span className="font-medium">{aqi.aqi}</span> ({aqi.category})
        </p>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-200">Map component placeholder. Next step: Leaflet + markers.</p>
          <p className="mt-2 text-xs text-gray-400">Updated: {aqi.updatedAt}</p>
          <div className="mt-4 text-sm">
            Spot demo: <Link className="underline" href="/spots/demo">/spots/demo</Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

