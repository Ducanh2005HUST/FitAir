import { useEffect, useMemo, useRef, useState } from 'react';
import { List, LocateFixed, MapPin, Search as SearchIcon, SlidersHorizontal, Star, Wind, X } from 'lucide-react';
import { Link } from 'react-router';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { apiClient } from '../api/client';
import type { SpotDto } from '../api/types';
import { useUserLocation } from '../location/useUserLocation';
import { googleMapsDirectionsUrl } from '../utils/maps';
import type * as L from 'leaflet';

function toYoutubeEmbed(url: string) {
  // supports https://www.youtube.com/watch?v=... and https://youtu.be/...
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    const id = u.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

export function MapScreen() {
  const [spots, setSpots] = useState<SpotDto[]>([]);
  const [aqi, setAqi] = useState<number>(75);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const { coords } = useUserLocation({ watch: true });
  const cacheRef = useRef(new Map<string, SpotDto[]>());
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'distance' | 'rating'>('distance');

  const coordKey = useMemo(() => {
    if (!coords) return 'hanoi-default';
    // Round so watch-position small jitter doesn't refetch constantly
    return `${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`;
  }, [coords]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = cacheRef.current.get(coordKey);
        if (cached) setSpots(cached);

        const aqiOut = await apiClient.aqi({ lat: coords?.lat, lng: coords?.lng });
        const s = await apiClient.spots({
          sort: coords ? sort : 'rating',
          lat: coords?.lat,
          lng: coords?.lng,
          radiusKm: 10,
        });
        if (cancelled) return;
        setAqi(aqiOut.aqi);
        const prev = cacheRef.current.get(coordKey) ?? [];
        const merged = new Map<string, SpotDto>();
        for (const p of prev) merged.set(p.id, p);
        for (const n of s) merged.set(n.id, n);
        const out = Array.from(merged.values());
        cacheRef.current.set(coordKey, out);
        setSpots(out);
      } catch {
        if (cancelled) return;
        setSpots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coordKey, coords?.lat, coords?.lng, sort]);

  const districts = useMemo(() => {
    const set = new Set<string>();
    for (const s of spots) if (s.district) set.add(s.district);
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [spots]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = selectedDistrict === 'all' ? spots : spots.filter((s) => (s.district ?? '').includes(selectedDistrict));
    if (q) {
      out = out.filter((s) => {
        const hay = `${s.name} ${s.address} ${s.district ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (sort === 'rating') {
      out = [...out].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    } else if (coords) {
      out = [...out].sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
    }
    return out;
  }, [spots, selectedDistrict, query, sort, coords]);

  const selectedSpot = useMemo(
    () => (selectedSpotId ? filtered.find((s) => s.id === selectedSpotId) : null),
    [filtered, selectedSpotId],
  );

  const center = useMemo(() => {
    if (coords) return [coords.lat, coords.lng] as [number, number];
    if (selectedSpot) return [selectedSpot.lat, selectedSpot.lng] as [number, number];
    if (filtered[0]) return [filtered[0].lat, filtered[0].lng] as [number, number];
    return [21.0285, 105.8542] as [number, number]; // Hanoi
  }, [coords, filtered, selectedSpot]);

  const markerColor = (aqiValue: number) => {
    if (aqiValue <= 50) return '#22c55e';
    if (aqiValue <= 100) return '#eab308';
    if (aqiValue <= 150) return '#f97316';
    return '#ef4444';
  };

  const spotImage = (s: SpotDto) => s.imageUrls?.[0] ?? '/src/imports/image-0.png';
  const fmtKm = (km: number | null | undefined) =>
    typeof km === 'number' && Number.isFinite(km) ? `${km.toFixed(2)}km` : '';
  const aqiDot = (aqiValue: number) => {
    if (aqiValue <= 50) return 'bg-green-500';
    if (aqiValue <= 100) return 'bg-yellow-500';
    if (aqiValue <= 150) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] bg-gray-50 flex flex-col md:flex-row overflow-hidden relative">
      <div
        className={`
          hidden md:flex md:flex-col
          w-[460px] bg-white shadow-xl z-20
          transition-all duration-300
          ${showSidebar ? 'md:translate-x-0' : 'md:-translate-x-full md:absolute'}
        `}
      >
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <SearchIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-semibold">Tìm kiếm / 検索</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tên địa điểm, khu vực... / 検索"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-12 py-3 text-sm outline-none focus:border-blue-300"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSort('distance')}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                sort === 'distance' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">↗</span>
              <span>Gần tôi</span>
            </button>
            <button
              type="button"
              onClick={() => setSort('rating')}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                sort === 'rating' ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Đánh giá cao</span>
            </button>
            <button
              type="button"
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                aqi <= 100 ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                // No per-spot AQI yet; keep as visual chip for now.
                setSelectedDistrict('all');
              }}
            >
              <Wind className="w-4 h-4" />
              <span>良いAQI / AQI tốt</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
            >
              <option value="distance">並び替え: 距離 / Khoảng cách</option>
              <option value="rating">並び替え: 評価 / Đánh giá</option>
            </select>
            <button
              type="button"
              className="w-12 h-12 rounded-2xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
              aria-label="Filters"
              onClick={() => {
                // district filter for now (simple)
                setSelectedDistrict(selectedDistrict === 'all' ? (districts[1] ?? 'all') : 'all');
              }}
            >
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          <div className="mt-5 text-blue-600 font-semibold text-lg">{filtered.length} kết quả / 結果</div>
        </div>

        <div className="flex-1 overflow-auto">
          {filtered.map((s) => (
            <div key={s.id} className="px-5 pb-5 first:pt-5">
              <div
                className={`rounded-3xl border shadow-sm bg-white overflow-hidden transition ${
                  selectedSpotId === s.id ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-100 hover:shadow-md'
                }`}
                onMouseEnter={() => setSelectedSpotId(s.id)}
                onMouseLeave={() => setSelectedSpotId(null)}
              >
                <div className="flex gap-4 p-4">
                  <div className="relative">
                    <img
                      src={spotImage(s)}
                      alt={s.name}
                      className="h-28 w-28 rounded-2xl object-cover border border-gray-100"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                      {s.type === 'indoor' ? '室内' : '屋外'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-semibold text-gray-900 truncate">{s.name}</div>
                    <div className="text-sm text-gray-500 truncate">{s.address}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(s.sports ?? []).slice(0, 2).map((sp) => (
                        <span key={sp} className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs font-medium">
                          {sp} / {sp}
                        </span>
                      ))}
                      {Array.isArray(s.sports) && s.sports.length > 2 ? (
                        <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold">+{s.sports.length - 2}</span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                      <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${aqiDot(aqi)}`} />
                        <span className="font-semibold">AQI {aqi}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="font-semibold">{(s.avgRating ?? 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{fmtKm(s.distanceKm)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <Link
                    to={`/location/${s.id}`}
                    className="block w-full rounded-2xl bg-blue-600 text-white text-center py-4 text-base font-semibold hover:bg-blue-700"
                  >
                    詳細を見る / Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!showSidebar ? (
        <button
          onClick={() => setShowSidebar(true)}
          className="hidden md:block absolute top-4 left-4 z-30 bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <List className="w-5 h-5 text-blue-600" />
        </button>
      ) : null}

      <div className="flex-1 relative">
        <MapContainer center={center} zoom={12} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {coords ? <LocateMeButton lat={coords.lat} lng={coords.lng} /> : null}
          {filtered.map((s) => (
            <MarkerWithPopup
              key={s.id}
              spot={s}
              aqi={aqi}
              isSelected={selectedSpotId === s.id}
              onSelect={() => setSelectedSpotId(s.id)}
              onHover={() => setSelectedSpotId(s.id)}
              onUnhover={() => {}}
              origin={coords ? { lat: coords.lat, lng: coords.lng } : null}
              markerColor={markerColor}
              fmtKm={fmtKm}
              spotImage={spotImage}
            />
          ))}

          {coords ? (
            <>
              {/* Outer pulse ring */}
              <CircleMarker
                center={[coords.lat, coords.lng]}
                radius={16}
                pathOptions={{ color: '#2563eb', weight: 1, fillColor: '#60a5fa', fillOpacity: 0.15 }}
              />
              {/* Inner dot */}
              <CircleMarker
                center={[coords.lat, coords.lng]}
                radius={8}
                pathOptions={{ color: '#1d4ed8', weight: 2, fillColor: '#3b82f6', fillOpacity: 1 }}
              >
                <Popup>あなたの位置 / Vị trí của bạn</Popup>
              </CircleMarker>
            </>
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}

function LocateMeButton(props: { lat: number; lng: number }) {
  const map = useMap();
  return (
    <div className="absolute right-5 bottom-6 z-[500]">
      <button
        type="button"
        onClick={() => map.flyTo([props.lat, props.lng], Math.max(map.getZoom(), 14), { duration: 0.6 })}
        className="h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center"
        aria-label="Locate me"
        title="あなたの位置 / Vị trí của bạn"
      >
        <LocateFixed className="w-5 h-5" />
      </button>
    </div>
  );
}

function MarkerWithPopup(props: {
  spot: SpotDto;
  aqi: number;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onUnhover: () => void;
  origin: { lat: number; lng: number } | null;
  markerColor: (aqi: number) => string;
  fmtKm: (km: number | null | undefined) => string;
  spotImage: (s: SpotDto) => string;
}) {
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (props.isSelected) marker.openPopup();
    else marker.closePopup();
  }, [props.isSelected]);

  const s = props.spot;
  return (
    <CircleMarker
      ref={(r) => {
        markerRef.current = r as unknown as L.CircleMarker | null;
      }}
      center={[s.lat, s.lng]}
      radius={10}
      pathOptions={{
        color: '#ffffff',
        weight: 2,
        fillColor: props.markerColor(props.aqi),
        fillOpacity: props.isSelected ? 1 : 0.8,
      }}
      eventHandlers={{
        click: () => props.onSelect(),
        mouseover: () => props.onHover(),
      }}
    >
      <Popup>
        <div className="w-64">
          <div className="flex gap-3">
            <img
              src={props.spotImage(s)}
              alt={s.name}
              className="h-16 w-20 rounded-lg object-cover border border-gray-100"
              loading="lazy"
            />
            <div className="min-w-0">
              <div className="font-medium truncate">{s.name}</div>
              <div className="text-xs text-gray-600 line-clamp-2">{s.address}</div>
              <div className="mt-1 text-xs text-gray-600">
                {props.fmtKm(s.distanceKm)} {s.avgRating ? ` • ★ ${s.avgRating.toFixed(1)}` : ''}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs hover:bg-gray-50"
              onClick={() => {
                window.open(
                  googleMapsDirectionsUrl({
                    destinationLat: s.lat,
                    destinationLng: s.lng,
                    originLat: props.origin?.lat,
                    originLng: props.origin?.lng,
                    travelMode: 'walking',
                  }),
                  '_blank',
                  'noreferrer',
                );
              }}
            >
              Chỉ đường / ナビ
            </button>
            <Link
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-xs font-semibold text-blue-700 hover:bg-gray-50"
              to={`/location/${s.id}`}
            >
              詳細を見る / Xem chi tiết
            </Link>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
