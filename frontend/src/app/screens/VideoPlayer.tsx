import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, User, Clock, Flame, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';

export function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState<any | null>(null);
  const [allVideos, setAllVideos] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    (async () => {
      try {
        const v = await http<any>(`/videos/${encodeURIComponent(id)}`);
        const list = await http<any[]>(`/videos`);
        if (cancelled) return;
        setVideo(v);
        setAllVideos(list);
      } catch {
        if (cancelled) return;
        setVideo(null);
        setAllVideos([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
        <p className="text-center text-gray-600">動画が見つかりませんでした</p>
      </div>
    );
  }

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      const videoId = u.searchParams.get('v') ?? u.pathname.split('/').filter(Boolean).pop();
      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return url;
    }
  };

  const levelLabel = (level?: string) => {
    if (!level) return '—';
    const v = level.toLowerCase();
    if (v.includes('easy') || v.includes('beginner')) return '初心者';
    if (v.includes('medium') || v.includes('intermediate')) return '中級者';
    if (v.includes('hard') || v.includes('advanced')) return '上級者';
    return level;
  };

  const recommended = useMemo(
    () => allVideos.filter((v) => v.id !== id).slice(0, 3),
    [allVideos, id],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>戻る</span>
      </button>

      {/* Video Player */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
        <div className="aspect-video bg-gray-900">
          <iframe
            width="100%"
            height="100%"
            src={getYouTubeEmbedUrl(video.youtubeUrl)}
            title={video.titleJp}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <div className="p-6">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl mb-2">{video.titleJp}</h1>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">時間</p>
                <p className="font-medium text-gray-900">{video.duration ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-3">
              <Flame className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">消費カロリー</p>
                <p className="font-medium text-gray-900">{video.calories ?? '—'} kcal</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">レベル</p>
                <p className="font-medium text-gray-900">{levelLabel(video.level)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">インストラクター</p>
                <p className="font-medium text-gray-900">{video.instructor ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
              {video.category ?? '一般'}
            </span>
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="font-medium text-lg mb-3">説明</h2>
            <p className="text-gray-700 mb-2">{video.description ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Recommended Videos */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl mb-4">おすすめの動画</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.map((recommendedVideo) => (
              <div
                key={recommendedVideo.id}
                onClick={() => navigate(`/video/${recommendedVideo.id}`)}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={youtubeThumb(recommendedVideo.youtubeUrl)}
                    alt={recommendedVideo.titleJp}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-8 border-l-blue-600 border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recommendedVideo.duration ?? ''}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{recommendedVideo.titleJp}</h3>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {recommendedVideo.category ?? '一般'}
                  </span>
                </div>
              </div>
            ))}
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
