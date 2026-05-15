import { Home, Users, User, Dumbbell, Calendar, LogOut, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'ダッシュボード' },
    { path: '/search', icon: Search, label: '検索・マップ' },
    { path: '/indoor', icon: Dumbbell, label: '室内トレーニング' },
    { path: '/schedule', icon: Calendar, label: 'スケジュール' },
    { path: '/community', icon: Users, label: 'コミュニティ' },
    { path: '/profile', icon: User, label: 'プロフィール' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">FitAir</h1>
        <p className="text-xs text-gray-500 mt-1">フィットエア</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
