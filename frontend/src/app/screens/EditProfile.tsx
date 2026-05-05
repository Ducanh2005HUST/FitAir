import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, Mail, MapPin, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { http } from '../api/http';

export function EditProfile() {
  const navigate = useNavigate();
  const { token, me, refreshMe } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    avatarUrl: '',
  });

  const [favoriteSports, setFavoriteSports] = useState(['ランニング', 'ヨガ', '筋トレ']);
  const [newSport, setNewSport] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!me) return;
    setFormData({
      name: me.name ?? '',
      email: me.email ?? '',
      location: me.location ?? '',
      bio: me.bio ?? '',
      avatarUrl: me.avatarUrl ?? '',
    });
  }, [me]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    try {
      await http('/users/me', {
        method: 'PUT',
        token,
        body: JSON.stringify({
          name: formData.name,
          avatarUrl: formData.avatarUrl || null,
          location: formData.location || null,
          bio: formData.bio || null,
        }),
      });
      await refreshMe();
      toast.success('プロフィールを更新しました', {
        description: 'Thông tin cá nhân đã được cập nhật thành công',
      });
      navigate('/profile');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const addSport = () => {
    if (newSport.trim() && !favoriteSports.includes(newSport.trim())) {
      setFavoriteSports([...favoriteSports, newSport.trim()]);
      setNewSport('');
    }
  };

  const removeSport = (sport: string) => {
    setFavoriteSports(favoriteSports.filter((s) => s !== sport));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            プロフィール編集
          </h1>
          <p className="text-sm text-gray-500">Chỉnh sửa thông tin cá nhân</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-blue-100 flex items-center justify-center">
                {formData.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">👤</span>
                )}
              </div>
              <input
                id="avatar-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 500 * 1024) {
                    toast.error('画像が大きすぎます', { description: 'Vui lòng chọn ảnh < 500KB' });
                    e.currentTarget.value = '';
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = String(reader.result ?? '');
                    setFormData((p) => ({ ...p, avatarUrl: dataUrl }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-file')?.click()}
              >
                写真を変更 / Đổi ảnh đại diện
              </Button>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100"></div>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span>名前 / Họ và tên</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="田中健太"
                className="rounded-[12px]"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>メール / Email</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tanaka@example.com"
                className="rounded-[12px]"
                required
              />
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>場所 / Địa điểm</span>
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="ハノイ, ベトナム"
                className="rounded-[12px]"
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                自己紹介 / Giới thiệu bản thân
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="自己紹介を入力してください..."
                rows={4}
                className="w-full rounded-[12px] border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100"></div>

            {/* Favorite Sports */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                お気に入りのスポーツ / Môn thể thao yêu thích
              </label>

              {/* Sports List */}
              <div className="flex flex-wrap gap-2">
                {favoriteSports.map((sport, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                  >
                    {sport}
                    <button
                      type="button"
                      onClick={() => removeSport(sport)}
                      className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                    >
                      <span className="text-xs">✕</span>
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Sport */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSport();
                    }
                  }}
                  placeholder="新しいスポーツを追加..."
                  className="rounded-[12px] flex-1"
                />
                <Button
                  type="button"
                  onClick={addSport}
                  variant="outline"
                  className="rounded-[16px]"
                >
                  追加
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 md:p-8 pt-0 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex-1 rounded-[16px]"
            >
              キャンセル / Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-[16px] bg-blue-500 hover:bg-blue-600 disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {isLoading ? '保存中…' : '保存 / Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
