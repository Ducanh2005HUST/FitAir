import { X, Wind } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/client';
import type { NotificationDto } from '../api/types';

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDialog({ open, onClose }: NotificationDialogProps) {
  if (!open) return null;

  return <NotificationDialogInner onClose={onClose} />;
}

function NotificationDialogInner({ onClose }: { onClose: () => void }) {
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    apiClient
      .notifications(token)
      .then((x) => {
        if (!cancelled) setItems(x);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const unreadCount = useMemo(() => items.filter((i) => !i.isRead).length, [items]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">通知 {unreadCount ? `(${unreadCount})` : ''}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {!token ? (
            <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
              ログインしてください / Vui lòng đăng nhập
              <div className="mt-3">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  ログイン
                </Link>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">No notifications</div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={async () => {
                  if (!token) return;
                  if (!n.isRead) {
                    await apiClient.markNotificationRead(token, n.id);
                    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
                  }
                }}
                className={`w-full text-left rounded-xl border p-4 transition ${
                  n.isRead ? 'border-gray-200 bg-white' : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Wind className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{n.title}</h3>
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="mt-2 text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
