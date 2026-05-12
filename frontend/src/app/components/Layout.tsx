import { Outlet, useSearchParams } from 'react-router';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NotificationDialog } from './NotificationDialog';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/client';

export function Layout() {
  const { token } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialNotificationId = searchParams.get('notificationId');

  useEffect(() => {
    if (initialNotificationId) setShowNotification(true);
  }, [initialNotificationId]);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setUnreadCount(0);
      return;
    }
    apiClient
      .notifications(token)
      .then((items) => {
        if (cancelled) return;
        setUnreadCount(items.filter((x) => !x.isRead).length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-600">FitAir</h1>
              <p className="text-xs text-gray-500">フィットエア</p>
            </div>
            <button 
              onClick={() => setShowNotification(true)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 ? <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> : null}
            </button>
          </div>
        </header>

        <header className="hidden md:flex px-8 py-4 absolute top-0 right-0 z-40">
          <div className="flex items-center justify-end">
            <button 
              onClick={() => setShowNotification(true)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 ? <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> : null}
            </button>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-8">
          <Outlet />
        </main>

        <BottomNav />
      </div>

      <NotificationDialog
        open={showNotification}
        initialNotificationId={initialNotificationId}
        onUnreadCountChange={(n) => setUnreadCount(n)}
        onClose={() => {
          setShowNotification(false);
          if (initialNotificationId) {
            const next = new URLSearchParams(searchParams);
            next.delete('notificationId');
            setSearchParams(next, { replace: true });
          }
        }}
      />
    </div>
  );
}
