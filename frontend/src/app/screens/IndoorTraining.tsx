import { useEffect, useMemo, useState } from 'react';
import { Play, Clock } from 'lucide-react';
import { AQIIndicator } from '../components/AQIIndicator';
import { currentAQI } from '../data/mockData';
import { http } from '../api/http';
import { VideoModal } from '../components/VideoModal';

export function IndoorTraining() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aqi, setAqi] = useState<number>(currentAQI.value);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [videoModal, setVideoModal] = useState<{ open: boolean; youtubeUrl?: string; title?: string }>({ open: false });

  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'yoga', label: 'ヨガ' },
    { id: 'stretch', label: 'ストレッチ' },
    { id: 'cardio', label: '有酸素' },
    { id: 'strength', label: '筋トレ' },
  ];

  const pageSize = 40;

  const loadPage = async (opts: { reset: boolean }) => {
    setLoading(true);
    try {
      const skip = opts.reset ? 0 : videos.length;
      const categoryParam = selectedCategory === 'all' ? '' : `category=${encodeURIComponent(selectedCategory)}&`;
      const out = await http<any[]>(`/videos?${categoryParam}take=${pageSize}&skip=${skip}`);
      const next = opts.reset ? out : [...videos, ...out];
      setVideos(next);
      setHasMore(out.length === pageSize);
    } catch {
      if (opts.reset) setVideos([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const aqiOut = await http<{ aqi: number }>('/environment/aqi');
        if (!cancelled) setAqi(aqiOut.aqi);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // reset list when category changes
    loadPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <VideoModal
        open={videoModal.open}
        youtubeUrl={videoModal.youtubeUrl}
        title={videoModal.title}
        onClose={() => setVideoModal({ open: false })}
      />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl mb-2">室内トレーニング</h1>
      </div>

      {/* AQI Warning */}
      {aqi > 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AQIIndicator value={aqi} />
            </div>
            <div>
              <h3 className="font-medium text-orange-900 mb-1">
                今日は室内での運動がおすすめです
              </h3>
              <p className="text-sm text-orange-700">
                現在の空気質が悪いため、屋外での運動は避けてください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm">{category.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() =>
              setVideoModal({
                open: true,
                youtubeUrl: video.youtubeUrl,
                title: video.titleJp ?? '動画',
              })
            }
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={youtubeThumb(video.youtubeUrl)}
                alt={video.titleJp}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-blue-600 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration ?? ''}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">{video.titleJp}</h3>
              
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {video.category ?? '一般'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-10 flex items-center justify-center">
        {hasMore ? (
          <button
            onClick={() => loadPage({ reset: false })}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? '読み込み中…' : 'もっと見る'}
          </button>
        ) : (
          <div className="text-xs text-gray-500">これ以上はありません</div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl mb-4">室内トレーニングのメリット</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white">✓</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">空気質の心配なし</h3>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white">✓</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">天候に左右されない</h3>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white">✓</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">いつでもどこでも</h3>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white">✓</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">プライバシー確保</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function youtubeThumb(url: string) {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '/src/imports/image-0.png';
}

function youtubeId(url: string) {
  try {
    const u = new URL(url);
    return u.searchParams.get('v') ?? u.pathname.split('/').filter(Boolean).pop() ?? null;
  } catch {
    return null;
  }
}
