import { Mail, MapPin, Calendar, User, Lock, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../auth/AuthContext';

export function Profile() {
  const { me, logout } = useAuth();

  const favoriteSports = [
    { name: 'ランニング', bg: 'bg-blue-50', text: 'text-blue-600' },
    { name: 'ヨガ', bg: 'bg-green-50', text: 'text-green-600' },
    { name: '筋トレ', bg: 'bg-orange-50', text: 'text-orange-600' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">プロフィール</h1>
        <p className="text-sm text-gray-500">アカウント情報</p>
      </div>

      {/* 1. Public Card */}
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm overflow-hidden">
              {me?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{me?.name ?? '—'}</h2>
              <div className="space-y-3 text-[15px] text-gray-600 inline-block text-left">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{me?.email ?? '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{me?.location ?? '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>参加: {me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Sports */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">お気に入りのスポーツ</h3>
            <div className="flex flex-wrap gap-2 mt-4">
              {favoriteSports.map((sport, index) => (
                <span
                  key={index}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${sport.bg} ${sport.text}`}
                >
                  {sport.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Private Card (Settings) */}
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900">アカウント設定</h3>
        </div>

        <div className="flex flex-col">
          {/* Row 1 */}
          <Link
            to="/profile/edit"
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 active:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-[12px]">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="text-[15px] font-medium text-gray-900">プロフィール編集</div>
                <div className="text-[12px] text-gray-500">プロフィール情報を編集します</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          {/* Row 2 */}
          <Link
            to="/profile/change-password"
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 active:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-[12px]">
                <Lock className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="text-[15px] font-medium text-gray-900">パスワード変更</div>
                <div className="text-[12px] text-gray-500">パスワードを変更します</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          {/* Row 3 */}
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center justify-between px-4 py-4 hover:bg-red-50 transition-colors active:bg-red-100 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-[12px]">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <div className="text-[15px] font-medium text-red-600">ログアウト</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
