import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';

export default function HomePage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">FitAir</h1>
        <p className="mt-2 text-sm text-gray-300">
          Scaffold theo đặc tả: AQI dashboard, map/search, spot, community, indoor training, schedule.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NavCard href="/auth/login" title="Login" desc="Auth screens" />
          <NavCard href="/map" title="Search & Map" desc="Map + list (placeholder)" />
          <NavCard href="/spots/demo" title="Spot detail" desc="Spot detail screen (placeholder)" />
          <NavCard href="/community" title="Community" desc="Posts + matching (placeholder)" />
          <NavCard href="/indoor" title="Indoor training" desc="Videos list (placeholder)" />
          <NavCard href="/schedule" title="Schedule" desc="Calendar (placeholder)" />
          <NavCard href="/profile" title="Profile" desc="Profile screens (placeholder)" />
        </div>
      </main>
    </AppShell>
  );
}

function NavCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
    >
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-xs text-gray-300">{desc}</div>
    </Link>
  );
}

