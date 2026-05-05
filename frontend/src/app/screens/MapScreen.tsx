import { useEffect, useMemo, useState } from 'react';
import { List, MapPin, X } from 'lucide-react';
import { Link } from 'react-router';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { apiClient } from '../api/client';
import type { SpotDto } from '../api/types';
import { useUserLocation } from '../location/useUserLocation';

export function MapScreen() {
  const [spots, setSpots] = useState<SpotDto[]>([]);
  const [aqi, setAqi] = useState<number>(75);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const { coords } = useUserLocation({ watch: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const aqiOut = await apiClient.aqi({ lat: coords?.lat, lng: coords?.lng });
        const s = await apiClient.spots({
          sort: coords ? 'distance' : 'rating',
          lat: coords?.lat,
          lng: coords?.lng,
          radiusKm: 30,
        });
        if (cancelled) return;
        setAqi(aqiOut.aqi);
        setSpots(s);
      } catch {
        if (cancelled) return;
        setSpots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coords?.lat, coords?.lng]);

  const districts = useMemo(() => {
    const set = new Set<string>();
    for (const s of spots) if (s.district) set.add(s.district);
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [spots]);

  const filtered = useMemo(() => {
    if (selectedDistrict === 'all') return spots;
    return spots.filter((s) => (s.district ?? '').includes(selectedDistrict));
  }, [spots, selectedDistrict]);

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

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] bg-gray-50 flex flex-col md:flex-row overflow-hidden relative">
      <div
        className={`
          hidden md:flex md:flex-col
          w-96 bg-white shadow-xl z-20
          transition-all duration-300
          ${showSidebar ? 'md:translate-x-0' : 'md:-translate-x-full md:absolute'}
        `}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg">地区別マップ / Bản đồ</h1>
            <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-600">
            AQI (now): <span className="font-medium">{aqi}</span>
          </p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs mb-2">地区 / District</h3>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === 'all' ? 'All' : d}
              </option>
            ))}
          </select>
          <div className="mt-3 text-xs text-gray-600">{filtered.length} spots</div>
        </div>

        <div className="flex-1 overflow-auto">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`p-3 border-b border-gray-100 cursor-pointer transition-all ${
                selectedSpotId === s.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setSelectedSpotId(s.id)}
              onMouseLeave={() => setSelectedSpotId(null)}
            >
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium mb-1 truncate">{s.name}</h3>
                  <p className="text-xs text-gray-600 mb-2 truncate">{s.address}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{s.district ?? ''}</span>
                  </div>
                </div>
              </div>
              <Link
                to={`/location/${s.id}`}
                className="block mt-2 text-center bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                詳細 / Chi tiết
              </Link>
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
          {filtered.map((s) => (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={10}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: markerColor(aqi),
                fillOpacity: selectedSpotId === s.id ? 1 : 0.8,
              }}
              eventHandlers={{
                click: () => setSelectedSpotId(s.id),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-600">{s.address}</div>
                  <div className="mt-2">
                    <Link className="text-blue-600 underline" to={`/location/${s.id}`}>
                      詳細を見る
                    </Link>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {coords ? (
            <CircleMarker
              center={[coords.lat, coords.lng]}
              radius={8}
              pathOptions={{ color: '#2563eb', weight: 2, fillColor: '#60a5fa', fillOpacity: 1 }}
            >
              <Popup>あなたの位置 / Your location</Popup>
            </CircleMarker>
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}
