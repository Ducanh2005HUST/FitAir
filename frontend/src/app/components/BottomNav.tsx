import { Home, Search, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function BottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'ホーム', labelVi: 'Trang chủ' },
    { path: '/search', icon: Search, label: '検索', labelVi: 'Tìm kiếm' },
    { path: '/community', icon: Users, label: 'コミュニティ', labelVi: 'Cộng đồng' },
    { path: '/profile', icon: User, label: 'プロフィール', labelVi: 'Hồ sơ' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
