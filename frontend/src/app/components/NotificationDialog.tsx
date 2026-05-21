import { X, Wind } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/client';
import type { NotificationDto } from '../api/types';
import { ensurePushSubscription } from '../push/webPush';
import { toast } from 'sonner';

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  initialNotificationId?: string | null;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationDialog({ open, onClose, initialNotificationId, onUnreadCountChange }: NotificationDialogProps) {
  if (!open) return null;

  return (
    <NotificationDialogInner
      onClose={onClose}
      initialNotificationId={initialNotificationId}
      onUnreadCountChange={onUnreadCountChange}
    />
  );
}

function NotificationDialogInner({
  onClose,
  initialNotificationId,
  onUnreadCountChange,
}: {
  onClose: () => void;
  initialNotificationId?: string | null;
  onUnreadCountChange?: (count: number) => void;
}) {
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

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">通知 {unreadCount ? `(${unreadCount})` : ''}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1" style={{ maxHeight: 'calc(85vh - 90px)' }}>
          {!token ? (
            <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
              ログインしてください
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
                ← 戻る
              </button>
              <div className="mt-2 font-medium text-gray-900">{selected.title}</div>
              <div className="mt-1 text-sm text-gray-700">{selected.message}</div>
              <div className="mt-2 text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</div>

              {selected.type === 'friend_request' && (selected.data as any)?.requesterId ? (
                <button
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-700"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      await apiClient.friendAccept(token, String((selected.data as any).requesterId));
                      toast.success('友達申請を承認しました');
                      await apiClient.markNotificationRead(token, selected.id);
                      setItems((prev) => prev.map((x) => (x.id === selected.id ? { ...x, isRead: true } : x)));
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : '失敗しました');
                    }
                  }}
                >
                  承認する
                </button>
              ) : null}

              {selected.data?.action?.path ? (
                <Link
                  to={selected.data.action.path}
                  onClick={onClose}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-700"
                >
                  {selected.data.action.label ?? '開く'}
                </Link>
              ) : null}
            </div>
          ) : isLoading ? (
            <div className="text-sm text-gray-600">読み込み中…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">通知はありません</div>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm hover:bg-gray-50 disabled:opacity-60"
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
                  {isEnablingPush ? '有効化中…' : 'プッシュ通知を有効化'}
                </button>
                <button
                  className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    if (!token) return;
                    await apiClient.clearNotifications(token);
                    setItems([]);
                  }}
                >
                  すべて削除
                </button>
              </div>
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
