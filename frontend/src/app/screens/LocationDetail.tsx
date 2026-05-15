import { useParams, Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Star, MapPin, Navigation, Clock, Users, MessageSquare } from 'lucide-react';
import { AQIIndicator } from '../components/AQIIndicator';
import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';
import { spotToLocation } from '../mappers/location';
import type { SpotDto } from '../api/types';
import { googleMapsDirectionsUrl } from '../utils/maps';
import { useUserLocation } from '../location/useUserLocation';

export function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromPostId = searchParams.get('fromPost');
  const [aqiValue, setAqiValue] = useState<number>(75);
  const [spot, setSpot] = useState<SpotDto | null>(null);
  const { coords } = useUserLocation();
  const [reviews, setReviews] = useState<
    { id: string; rating: number; comment?: string | null; createdAt: string; user?: { name?: string | null } }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    (async () => {
      try {
        const aqiOut = await http<{ aqi: number }>('/environment/aqi');
        const spotOut = await http<SpotDto>(`/spots/${encodeURIComponent(id)}`);
        const revOut = await http<any[]>(`/spots/${encodeURIComponent(id)}/reviews`);
        if (cancelled) return;
        setAqiValue(aqiOut.aqi);
        setSpot(spotOut);
        setReviews(revOut);
      } catch {
        if (cancelled) return;
        setSpot(null);
        setReviews([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const location = useMemo(() => {
    if (!spot) return null;
    return spotToLocation(spot, aqiValue);
  }, [spot, aqiValue]);

  if (!location) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl mb-4">施設が見つかりません</h2>
        <Link to="/search" className="text-blue-600 hover:underline">
          検索に戻る
        </Link>
      </div>
    );
  }

  const handleBackClick = () => {
    if (fromPostId) {
      // Navigate back to community with scroll to post
      navigate(`/community?scrollTo=${fromPostId}`);
    } else {
      // Just go back
      navigate(-1);
    }
  };

  const crowdLevelText = {
    low: { ja: '空いている', color: 'text-green-600' },
    medium: { ja: '普通', color: 'text-yellow-600' },
    high: { ja: '混雑', color: 'text-red-600' },
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header Image */}
      <div className="relative h-64 md:h-96">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleBackClick}
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors group"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        {fromPostId && (
          <div className="absolute top-4 left-16 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-left duration-300">
            <span>📝</span>
            <span>投稿から</span>
          </div>
        )}
          <div className="absolute top-4 right-4">
            <AQIIndicator value={location.aqi} />
          </div>
        </div>

      <div className="px-4 py-6 md:px-8">
        {/* Title and Rating */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl mb-2">{location.name}</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-lg">{location.rating}</span>
              <span className="text-sm text-gray-500">({reviews.length}件のレビュー)</span>
            </div>
            
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{location.distance}km</span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="text-2xl mb-1">🌡️ {location.temperature}°C</div>
            <div className="text-xs text-gray-600">温度</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className={`text-2xl mb-1 ${crowdLevelText[location.crowdLevel].color}`}>
              <Users className="w-8 h-8" />
            </div>
            <div className="text-xs text-gray-600">{crowdLevelText[location.crowdLevel].ja}</div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xs text-gray-600">{location.price}</div>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="text-2xl mb-1">
              {location.indoor ? '🏢' : '🌳'}
            </div>
            <div className="text-xs text-gray-600">
              {location.indoor ? '室内' : '屋外'}
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="mb-6">
          <h2 className="text-lg mb-3">施設・設備</h2>
          <div className="flex flex-wrap gap-2">
            {location.facilities.map((facility) => (
              <span
                key={facility}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>

        {/* Sport Types */}
        <div className="mb-6">
          <h2 className="text-lg mb-3">利用可能なスポーツ</h2>
          <div className="flex flex-wrap gap-2">
            {location.sportTypes.map((sport) => (
              <span
                key={sport}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
            onClick={() => {
              window.open(
                googleMapsDirectionsUrl({
                  destinationLat: location.lat,
                  destinationLng: location.lng,
                  originLat: coords?.lat,
                  originLng: coords?.lng,
                  travelMode: 'walking',
                }),
                '_blank',
                'noreferrer',
              );
            }}
          >
            <Navigation className="w-5 h-5" />
            <span>ナビ</span>
          </button>
          
          <Link
            to={`/review/${location.id}`}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span>レビューを書く</span>
          </Link>
        </div>

        {/* Opening Hours */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium">営業時間</h3>
          </div>
          <p className="text-sm text-gray-700">月〜金: 6:00 - 22:00</p>
          <p className="text-sm text-gray-700">土日: 7:00 - 20:00</p>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-lg mb-4">レビュー</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <div className="font-medium">{review.user?.name ?? '—'}</div>
                      <div className="flex items-center gap-1 text-yellow-600 text-sm">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment ?? ''}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm text-gray-600">まだレビューがありません</p>
              <p className="text-xs text-gray-500">最初のレビューを書きましょう！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
