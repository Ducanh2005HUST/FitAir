import { X, Wind } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/client';
import type { NotificationDto } from '../api/types';
import { ensurePushSubscription } from '../push/webPush';

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  initialNotificationId?: string | null;
}

export function NotificationDialog({ open, onClose, initialNotificationId }: NotificationDialogProps) {
  if (!open) return null;

  return <NotificationDialogInner onClose={onClose} initialNotificationId={initialNotificationId} />;
}

function NotificationDialogInner({ onClose, initialNotificationId }: { onClose: () => void; initialNotificationId?: string | null }) {
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialNotificationId ?? null);
  const [isEnablingPush, setIsEnablingPush] = useState(false);

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

  useEffect(() => {
    if (initialNotificationId) setSelectedId(initialNotificationId);
  }, [initialNotificationId]);

  const unreadCount = useMemo(() => items.filter((i) => !i.isRead).length, [items]);
  const selected = useMemo(() => items.find((x) => x.id === selectedId) ?? null, [items, selectedId]);

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
          ) : selected ? (
            <div className="rounded-xl border border-gray-200 p-4">
              <button className="text-xs text-blue-600 hover:underline" onClick={() => setSelectedId(null)}>
                ← Back
              </button>
              <div className="mt-2 font-medium text-gray-900">{selected.title}</div>
              <div className="mt-1 text-sm text-gray-700">{selected.message}</div>
              <div className="mt-2 text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</div>

              {selected.data?.action?.path ? (
                <Link
                  to={selected.data.action.path}
                  onClick={onClose}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-700"
                >
                  {selected.data.action.label ?? 'Open'}
                </Link>
              ) : null}
            </div>
          ) : isLoading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">No notifications</div>
          ) : (
            <>
              <button
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm hover:bg-gray-50 disabled:opacity-60"
                disabled={isEnablingPush}
                onClick={async () => {
                  if (!token) return;
                  setIsEnablingPush(true);
                  try {
                    const { publicKey } = await apiClient.pushPublicKey();
                    const sub = await ensurePushSubscription(publicKey);
                    if (!sub) return;
                    const json = sub.toJSON();
                    if (!json?.endpoint || !json?.keys?.p256dh || !json?.keys?.auth) return;
                    await apiClient.pushSubscribe(token, {
                      endpoint: json.endpoint,
                      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
                      userAgent: navigator.userAgent,
                    });
                  } finally {
                    setIsEnablingPush(false);
                  }
                }}
              >
                {isEnablingPush ? 'Enabling…' : '通知を有効化 / Enable push'}
              </button>
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={async () => {
                    if (!token) return;
                    setSelectedId(n.id);
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
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
