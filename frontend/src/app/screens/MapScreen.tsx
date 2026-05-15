import { useEffect, useMemo, useRef, useState } from 'react';
import { List, LocateFixed, MapPin, Search as SearchIcon, SlidersHorizontal, Star, Wind, X } from 'lucide-react';
import { Link } from 'react-router';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
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
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const { coords } = useUserLocation({ watch: true });
  // If location permission is denied/unavailable, fall back to Hanoi center so we can still load spots.
  const effectiveCoords = useMemo(() => coords ?? { lat: 21.0285, lng: 105.8542 }, [coords]);
  const cacheRef = useRef(new Map<string, SpotDto[]>());
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'distance' | 'rating' | 'aqi' | 'name'>('distance');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [sport, setSport] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<{ indoor: boolean; outdoor: boolean }>({ indoor: false, outdoor: false });
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!showSortMenu) return;
      const el = sortMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setShowSortMenu(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [showSortMenu]);

  const coordKey = useMemo(() => {
    // Round so watch-position small jitter doesn't refetch constantly
    return `${effectiveCoords.lat.toFixed(3)},${effectiveCoords.lng.toFixed(3)}`;
  }, [effectiveCoords.lat, effectiveCoords.lng]);

  const cacheKey = useMemo(() => {
    const typeKey = typeFilter.indoor && !typeFilter.outdoor ? 'indoor' : typeFilter.outdoor && !typeFilter.indoor ? 'outdoor' : 'all';
    return `${coordKey}|r=${radiusKm}|d=${selectedDistrict}|s=${sport}|t=${typeKey}`;
  }, [coordKey, radiusKm, selectedDistrict, sport, typeFilter.indoor, typeFilter.outdoor]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cached = cacheRef.current.get(cacheKey);
        if (cached) setSpots(cached);

        const aqiOut = await apiClient.aqi({ lat: effectiveCoords.lat, lng: effectiveCoords.lng });
        const s = await apiClient.spots({
          sort: sort === 'aqi' || sort === 'name' ? 'distance' : sort,
          lat: effectiveCoords.lat,
          lng: effectiveCoords.lng,
          radiusKm,
          district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
          sport: sport !== 'all' ? sport : undefined,
          type:
            typeFilter.indoor && !typeFilter.outdoor
              ? 'indoor'
              : typeFilter.outdoor && !typeFilter.indoor
                ? 'outdoor'
                : undefined,
        });
        if (cancelled) return;
        setAqi(aqiOut.aqi);
        cacheRef.current.set(cacheKey, s);
        setSpots(s);
      } catch {
        if (cancelled) return;
        setSpots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, effectiveCoords.lat, effectiveCoords.lng, sort, radiusKm, selectedDistrict, sport, typeFilter.indoor, typeFilter.outdoor]);

  const districts = useMemo(() => {
    // Keep a stable list (regardless of current results) so filtering always works.
    return ['all', ...HANOI_DISTRICTS.map((d) => d.key)];
  }, [spots]);

  const sports = useMemo(() => {
    const set = new Set<string>();
    for (const s of spots) for (const sp of s.sports ?? []) set.add(sp);
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
    if (sport !== 'all') out = out.filter((s) => (s.sports ?? []).includes(sport));
    if (typeFilter.indoor !== typeFilter.outdoor) {
      out = out.filter((s) => (typeFilter.indoor ? s.type === 'indoor' : s.type === 'outdoor'));
    }
    if (minRating > 0) out = out.filter((s) => (s.avgRating ?? 0) >= minRating);
    if (radiusKm > 0) out = out.filter((s) => (s.distanceKm ?? Infinity) <= radiusKm);

    if (sort === 'rating') {
      out = [...out].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    } else if (sort === 'name') {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'aqi') {
      // We don't have per-spot AQI yet; keep stable
      out = [...out];
    } else {
      out = [...out].sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
    }
    return out;
  }, [spots, selectedDistrict, query, sort, sport, typeFilter.indoor, typeFilter.outdoor, minRating, radiusKm]);

  const selectedSpot = useMemo(
    () => {
      const activeId = selectedSpotId ?? hoveredSpotId;
      return activeId ? filtered.find((s) => s.id === activeId) : null;
    },
    [filtered, hoveredSpotId, selectedSpotId],
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

  const spotImage = (s: SpotDto) => s.imageUrls?.[0] ?? '';
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
      {showFilterModal ? (
        <div className="fixed inset-0 z-[3000] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowFilterModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                </div>
              <div className="text-xl font-semibold">フィルター</div>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setShowFilterModal(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div>
                <div className="text-sm font-semibold mb-2">地区</div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d === 'all' ? 'すべての地区' : districtLabelJa(d)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">スポーツ</div>
                <select value={sport} onChange={(e) => setSport(e.target.value)} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm">
                  {sports.map((s) => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'すべて' : s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">距離（現在地から）</div>
                  <div className="text-blue-600 font-semibold">{radiusKm} km</div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">場所</div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4">
                    <input type="checkbox" checked={typeFilter.indoor} onChange={(e) => setTypeFilter((p) => ({ ...p, indoor: e.target.checked }))} />
                    <span className="font-semibold">室内</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4">
                    <input type="checkbox" checked={typeFilter.outdoor} onChange={(e) => setTypeFilter((p) => ({ ...p, outdoor: e.target.checked }))} />
                    <span className="font-semibold">屋外</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">評価（最低）</div>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
                >
                  <option value={0}>すべて</option>
                  <option value={3}>3.0+</option>
                  <option value={4}>4.0+</option>
                  <option value={4.5}>4.5+</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex gap-4">
              <button
                className="flex-1 rounded-2xl border border-gray-200 bg-white py-4 font-semibold hover:bg-gray-50"
                onClick={() => {
                  setSelectedDistrict('all');
                  setSport('all');
                  setRadiusKm(10);
                  setTypeFilter({ indoor: false, outdoor: false });
                  setMinRating(0);
                }}
              >
                リセット
              </button>
              <button
                className="flex-[1.4] rounded-2xl bg-blue-600 text-white py-4 font-semibold hover:bg-blue-700"
                onClick={() => setShowFilterModal(false)}
              >
                {filtered.length} 件を表示
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
              <div className="text-xl font-semibold">検索</div>
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
                placeholder="場所名・エリアで検索"
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
              <span>近い</span>
            </button>
            <button
              type="button"
              onClick={() => setSort('rating')}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                sort === 'rating' ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>高評価</span>
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
              <span>AQI が良い</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => setShowSortMenu((v) => !v)}
                className="w-full flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm hover:bg-gray-50"
              >
                <span>
                  {sort === 'distance'
                    ? '並び替え: 距離'
                    : sort === 'rating'
                      ? '並び替え: 評価'
                      : sort === 'aqi'
                        ? '並び替え: AQI'
                        : '並び替え: 名前'}
                </span>
                <span className="text-gray-400">▾</span>
              </button>
              {showSortMenu ? (
                <div className="absolute top-[54px] left-0 right-0 z-30 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                  {(
                    [
                      { id: 'distance', label: '並び替え: 距離' },
                      { id: 'rating', label: '並び替え: 評価' },
                      { id: 'aqi', label: '並び替え: AQI' },
                      { id: 'name', label: '並び替え: 名前' },
                    ] as const
                  ).map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${sort === it.id ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => {
                        setSort(it.id as any);
                        setShowSortMenu(false);
                      }}
                    >
                      {sort === it.id ? '✓ ' : ''}
                      {it.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="w-12 h-12 rounded-2xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
              aria-label="フィルター"
              onClick={() => {
                setShowFilterModal(true);
              }}
            >
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          <div className="mt-5 text-blue-600 font-semibold text-lg">{filtered.length} 件</div>
        </div>

        <div className="flex-1 overflow-auto">
          {filtered.map((s) => (
            <div key={s.id} className="px-5 pb-5 first:pt-5">
              <div
                className={`rounded-3xl border shadow-sm bg-white overflow-hidden transition ${
                  (selectedSpotId ?? hoveredSpotId) === s.id
                    ? 'border-blue-200 ring-2 ring-blue-100'
                    : 'border-gray-100 hover:shadow-md'
                }`}
                onMouseEnter={() => setHoveredSpotId(s.id)}
                onMouseLeave={() => setHoveredSpotId((prev) => (prev === s.id ? null : prev))}
              >
                <div className="flex gap-4 p-4">
                  <div className="relative">
                    {spotImage(s) ? (
                      <img
                        src={spotImage(s)}
                        alt={s.name}
                        className="h-28 w-28 rounded-2xl object-cover border border-gray-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-100" />
                    )}
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
                          {sp}
                        </span>
                      ))}
                      {Array.isArray(s.sports) && s.sports.length > 2 ? (
                        <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold">+{s.sports.length - 2}</span>
                      ) : null}
                    </div>

                    {Array.isArray(s.facilities) && s.facilities.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {s.facilities.slice(0, 3).map((f) => (
                          <span key={f} className="rounded-full bg-gray-50 text-gray-700 border border-gray-100 px-3 py-1 text-xs">
                            {f}
                          </span>
                        ))}
                        {s.facilities.length > 3 ? (
                          <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold">+{s.facilities.length - 3}</span>
                        ) : null}
                      </div>
                    ) : null}

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
                    詳細を見る
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
          <ClearSelectionOnMapClick onClear={() => setSelectedSpotId(null)} />
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
              isSelected={(selectedSpotId ?? hoveredSpotId) === s.id}
              onSelect={() => setSelectedSpotId(s.id)}
              onHover={() => setHoveredSpotId(s.id)}
              onUnhover={() => setHoveredSpotId((prev) => (prev === s.id ? null : prev))}
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
                <Popup>現在地</Popup>
              </CircleMarker>
            </>
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}

const HANOI_DISTRICTS: { key: string; ja: string }[] = [
  { key: 'Ba Đình', ja: 'バーディン区' },
  { key: 'Hoàn Kiếm', ja: 'ホアンキエム区' },
  { key: 'Hai Bà Trưng', ja: 'ハイバーチュン区' },
  { key: 'Đống Đa', ja: 'ドンダー区' },
  { key: 'Cầu Giấy', ja: 'カウザイ区' },
  { key: 'Tây Hồ', ja: 'タイホー区' },
  { key: 'Thanh Xuân', ja: 'タインスアン区' },
  { key: 'Hoàng Mai', ja: 'ホアンマイ区' },
  { key: 'Long Biên', ja: 'ロンビエン区' },
  { key: 'Hà Đông', ja: 'ハードン区' },
  { key: 'Nam Từ Liêm', ja: 'ナムトゥーリエム区' },
  { key: 'Bắc Từ Liêm', ja: 'バクトゥーリエム区' },
  { key: 'Gia Lâm', ja: 'ザーラム県' },
  { key: 'Đông Anh', ja: 'ドンアイン県' },
  { key: 'Thanh Trì', ja: 'タインチー県' },
  { key: 'Sóc Sơn', ja: 'ソックソン県' },
];

function districtLabelJa(key: string) {
  return HANOI_DISTRICTS.find((d) => d.key === key)?.ja ?? key;
}

function ClearSelectionOnMapClick(props: { onClear: () => void }) {
  useMapEvents({
    click: () => props.onClear(),
  });
  return null;
}

function LocateMeButton(props: { lat: number; lng: number }) {
  const map = useMap();
  return (
    <div className="absolute right-5 bottom-6 z-[500]">
      <button
        type="button"
        onClick={() => map.flyTo([props.lat, props.lng], Math.max(map.getZoom(), 14), { duration: 0.6 })}
        className="h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center"
        aria-label="現在地へ"
        title="現在地へ"
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
        mouseout: () => props.onUnhover(),
      }}
    >
      <Popup>
        <div className="w-64">
          <div className="flex gap-3">
            {props.spotImage(s) ? (
              <img
                src={props.spotImage(s)}
                alt={s.name}
                className="h-16 w-20 rounded-lg object-cover border border-gray-100"
                loading="lazy"
              />
            ) : (
              <div className="h-16 w-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-100" />
            )}
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
              ナビ
            </button>
            <Link
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-xs font-semibold text-blue-700 hover:bg-gray-50"
              to={`/location/${s.id}`}
            >
              詳細を見る
            </Link>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
