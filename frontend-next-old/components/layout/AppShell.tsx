import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link href="/" className="font-semibold">
            FitAir
          </Link>
          <nav className="flex gap-3 text-sm text-gray-200">
            <Link href="/map">Map</Link>
            <Link href="/community">Community</Link>
            <Link href="/indoor">Indoor</Link>
            <Link href="/schedule">Schedule</Link>
            <Link href="/profile">Profile</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

