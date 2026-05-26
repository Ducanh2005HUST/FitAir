import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { apiClient } from '../api/client';
import { useAuth } from '../auth/AuthContext';

function Avatar(props: { name: string; url?: string | null; size?: number }) {
  const size = props.size ?? 80;
  const initials = props.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join('');
  return (
    <div
      className="rounded-full bg-blue-100 text-blue-700 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      {props.url ? (
        <img src={props.url} alt="avatar" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xl font-bold">{initials || 'U'}</span>
      )}
    </div>
  );
}

export function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, me } = useAuth();

  const [profile, setProfile] = useState<any | null>(null);
  const [relationship, setRelationship] = useState<
    'self' | 'none' | 'friends' | 'outgoing_pending' | 'incoming_pending' | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    (async () => {
      try {
        const [p, rel] = await Promise.all([
          token ? apiClient.userDetail(token, id) : apiClient.publicUser(id),
          token ? apiClient.friendRelationship(token, id) : Promise.resolve({ status: 'none' as const }),
        ]);
        if (cancelled) return;
        setProfile(p);
        setRelationship(rel.status);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'プロフィールの読み込みに失敗しました');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  if (!id) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          onClick={() => navigate(-1)}
        >
          戻る
        </button>
        {profile?.id === me?.id ? (
          <Link className="text-blue-600 underline text-sm" to="/profile">
            自分のプロフィールへ
          </Link>
        ) : null}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <Avatar name={profile?.name ?? 'User'} url={profile?.avatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold truncate">{profile?.name ?? '—'}</div>
            <div className="text-sm text-gray-600 truncate">{profile?.location ?? ''}</div>
            {profile?.email && profile?.emailVisible ? (
              <div className="mt-1 text-sm text-gray-600 truncate">{profile.email}</div>
            ) : null}
            <div className="mt-1 text-xs text-gray-500">
              参加日: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
            </div>
            <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{profile?.bio ?? ''}</div>
            {Array.isArray(profile?.sports) && profile.sports.length ? (
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">お気に入りのスポーツ</div>
                <div className="flex flex-wrap gap-2">
                  {profile.sports.map((s: any) => (
                    <span
                      key={s.sport}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      {s.sport}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {profile?.id && profile?.id !== me?.id ? (
          <div className="mt-5 flex gap-2">
            {relationship === 'friends' ? (
              <>
                <button type="button" className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700" disabled>
                  友達
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      await apiClient.friendRemove(token, profile.id);
                      setRelationship('none');
                      toast.success('友達を解除しました');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : '失敗しました');
                    }
                  }}
                >
                  友達解除
                </button>
              </>
            ) : relationship === 'outgoing_pending' ? (
              <>
                <button type="button" className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700" disabled>
                  申請中
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      await apiClient.friendCancelRequest(token, profile.id);
                      setRelationship('none');
                      toast.success('申請を取り消しました');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : '失敗しました');
                    }
                  }}
                >
                  申請を取り消す
                </button>
              </>
            ) : relationship === 'incoming_pending' ? (
              <>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white font-semibold hover:bg-blue-700"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      await apiClient.friendAccept(token, profile.id);
                      setRelationship('friends');
                      toast.success('承認しました');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : '失敗しました');
                    }
                  }}
                >
                  承認
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      await apiClient.friendReject(token, profile.id);
                      setRelationship('none');
                      toast.success('削除しました');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : '失敗しました');
                    }
                  }}
                >
                  削除
                </button>
              </>
            ) : (
              <button
                type="button"
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white font-semibold hover:bg-blue-700"
                onClick={async () => {
                  if (!token) return;
                  try {
                    await apiClient.friendRequest(token, profile.id);
                    setRelationship('outgoing_pending');
                    toast.success('友達申請を送信しました');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : '失敗しました');
                  }
                }}
              >
                友達追加
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
