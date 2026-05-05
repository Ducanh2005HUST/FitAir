import { useEffect, useMemo, useState } from 'react';

type Coords = { lat: number; lng: number; accuracy?: number };

const STORAGE_KEY = 'fitair.last_location';

function readCached(): Coords | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as any;
    if (typeof v?.lat !== 'number' || typeof v?.lng !== 'number') return null;
    return { lat: v.lat, lng: v.lng, accuracy: typeof v.accuracy === 'number' ? v.accuracy : undefined };
  } catch {
    return null;
  }
}

function writeCached(c: Coords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    // ignore
  }
}

export function useUserLocation(opts?: { enableHighAccuracy?: boolean; watch?: boolean }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    const cached = readCached();
    if (cached) setCoords(cached);
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      setError('Geolocation not supported');
      return;
    }

    setStatus('loading');
    const success = (pos: GeolocationPosition) => {
      const c = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
      setCoords(c);
      writeCached(c);
      setError(null);
      setStatus('ready');
    };
    const failure = (e: GeolocationPositionError) => {
      setStatus('error');
      setError(e.message);
    };

    if (opts?.watch) {
      const id = navigator.geolocation.watchPosition(success, failure, {
        enableHighAccuracy: opts.enableHighAccuracy ?? true,
        maximumAge: 30_000,
        timeout: 10_000,
      });
      return () => navigator.geolocation.clearWatch(id);
    }

    navigator.geolocation.getCurrentPosition(success, failure, {
      enableHighAccuracy: opts?.enableHighAccuracy ?? true,
      maximumAge: 60_000,
      timeout: 10_000,
    });
  }, [opts?.enableHighAccuracy, opts?.watch]);

  const value = useMemo(() => ({ coords, status, error }), [coords, status, error]);
  return value;
}

