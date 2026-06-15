import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Star } from 'lucide-react';
import { toast } from 'sonner';
import { http } from '../api/http';
import { spotToLocation } from '../mappers/location';
import { getAqiForSpot } from '../utils/maps';
import type { SpotDto } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useUserLocation } from '../location/useUserLocation';

export function Review() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [aqiValue, setAqiValue] = useState<number>(75);
  const [spot, setSpot] = useState<SpotDto | null>(null);
  const { coords } = useUserLocation();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    (async () => {
      try {
        const aqiOut = await http<{ aqi: number }>('/environment/aqi');
        const spotOut = await http<SpotDto>(`/spots/${encodeURIComponent(id)}`);
        
        // Try to fetch existing review
        if (token) {
          try {
            const myReview = await http<{ rating: number; comment?: string }>(
              `/spots/${encodeURIComponent(id)}/reviews/me`,
              { token }
            );
            if (!cancelled && myReview) {
              setRating(myReview.rating);
              setComment(myReview.comment || '');
              setIsEditing(true);
            }
          } catch {
            // No existing review found or other error, do nothing
          }
        }

        if (cancelled) return;
        setAqiValue(aqiOut.aqi);
        setSpot(spotOut);
      } catch {
        if (cancelled) return;
        setSpot(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const location = useMemo(() => {
    if (!spot) return null;
    return spotToLocation(spot, getAqiForSpot(spot, aqiValue), coords);
  }, [spot, aqiValue, coords]);

  if (!location) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl mb-4">施設が見つかりません</h2>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('評価を選択してください');
      return;
    }

    if (comment.trim() === '') {
      toast.error('コメントを入力してください');
      return;
    }

    if (!token) return;
    setIsLoading(true);
    try {
      await http(`/spots/${encodeURIComponent(id ?? '')}/reviews`, {
        method: 'POST',
        token,
        body: JSON.stringify({ rating, comment }),
      });
      toast.success(isEditing ? 'レビューを更新しました！' : 'レビューを投稿しました！');
      navigate(-1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '投稿に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>戻る</span>
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
        <h1 className="text-2xl mb-2">{isEditing ? 'レビューを編集する' : 'レビューを書く'}</h1>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <img
              src={location.image}
              alt={location.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-medium">{location.name}</h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm mb-3">
              評価
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-none text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 5 && '素晴らしい！'}
                {rating === 4 && '良い'}
                {rating === 3 && '普通'}
                {rating === 2 && '悪い'}
                {rating === 1 && '非常に悪い'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm mb-2">
              コメント
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="この施設についてのご意見をお聞かせください..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-2">
              {comment.length} / 500 文字
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              {isLoading ? (isEditing ? '更新中…' : '投稿中…') : (isEditing ? '更新する' : '投稿する')}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="text-sm mb-2">💡 レビューのヒント</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 清潔さや設備の状態について</li>
          <li>• スタッフの対応</li>
          <li>• 混雑具合や雰囲気</li>
          <li>• おすすめポイント</li>
        </ul>
      </div>
    </div>
  );
}
