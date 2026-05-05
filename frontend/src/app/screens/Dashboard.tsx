import {
  MapPin,
  Clock,
  Dumbbell,
  Users,
  Search,
} from "lucide-react";
import { Link } from "react-router";
import { AQIIndicator } from "../components/AQIIndicator";
import { currentAQI } from "../data/mockData";
import { LocationCard } from "../components/LocationCard";
import { useEffect, useState } from "react";
import { http } from "../api/http";
import { spotToLocation } from "../mappers/location";
import type { SpotDto } from "../api/types";

export function Dashboard() {
  const [aqi, setAqi] = useState<{ aqi: number; category: string } | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const aqiOut = await http<{ aqi: number; category: string }>('/environment/aqi');
        const spots = await http<SpotDto[]>(`/spots?sort=rating`);
        if (cancelled) return;
        setAqi(aqiOut);
        setNearbyLocations(spots.slice(0, 3).map((s) => spotToLocation(s, aqiOut.aqi)));
      } catch {
        // fallback to mock
        if (cancelled) return;
        setAqi({ aqi: currentAQI.value, category: 'mock' });
        setNearbyLocations([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
      {/* Hero Section with AQI */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl mb-2">
          おはようございます
        </h1>
        <p className="text-sm text-gray-600">Chào buổi sáng</p>
      </div>

      {/* Current AQI Card */}
      <div className="mb-8">
        <AQIIndicator value={aqi?.aqi ?? currentAQI.value} size="large" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl mb-1">
              🌡️ {currentAQI.temperature}°C
            </div>
            <div className="text-sm text-gray-600">
              温度 / Nhiệt độ
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-2xl mb-1">
              💧 {currentAQI.humidity}%
            </div>
            <div className="text-sm text-gray-600">
              湿度 / Độ ẩm
            </div>
          </div>
        </div>
      </div>

      {/* Best Time to Workout */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg mb-1">おすすめの運動時間</h3>
            <p className="text-sm opacity-90 mb-2">
              Thời gian tập tốt nhất
            </p>
            <div className="text-2xl">
              {currentAQI.bestTime}
            </div>
            <p className="text-sm opacity-75 mt-2">
              空気質が最も良い時間帯です
            </p>
          </div>
        </div>
      </div>

      {/* Nearby Locations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl">近くの施設</h2>
            <p className="text-sm text-gray-500">
              Địa điểm gần bạn
            </p>
          </div>
          <Link
            to="/search"
            className="text-blue-600 text-sm hover:underline"
          >
            すべて見る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nearbyLocations.length === 0 ? (
            <div className="col-span-full text-sm text-gray-500">Loading…</div>
          ) : (
            nearbyLocations.map((location: any) => (
              <LocationCard key={location.id} location={location} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
