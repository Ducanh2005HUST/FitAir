import { Calendar, Mail, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { apiClient } from '../api/client';
import { useAuth } from '../auth/AuthContext';

type Relationship = 'self' | 'none' | 'friends' | 'outgoing_pending' | 'incoming_pending';

function sportStyle(index: number) {
  const styles = [
    'bg-blue-50 text-blue-600',
    'bg-green-50 text-green-600',
    'bg-orange-50 text-orange-600',
    'bg-purple-50 text-purple-600',
  ];
  return styles[index % styles.length];
}

const fallbackSports = ['ランニング', 'ヨガ', '筋トレ'];

export function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, me } = useAuth();

  const [profile, setProfile] = useState<any | null>(null);
  const [relationship, setRelationship] = useState<Relationship | null>(null);

  const sports = useMemo(() => {
    if (!Array.isArray(profile?.sports)) return fallbackSports;
    const values = profile.sports.map((s: any) => String(s.sport ?? '').trim()).filter(Boolean);
    return values.length ? values : fallbackSports;
  }, [profile?.sports]);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    (async () => {
      try {
        const [p, rel] = await Promise.all([
          token ? apiClient.userDetail(token, id) : apiClient.publicUser(id),
          token ? apiClient.friendRelationship(token, id) : Promise.resolve({ status: 'none' as Relationship }),
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

  const handleAddFriend = async () => {
    if (!token || !profile?.id) return;
    try {
      const out: any = await apiClient.friendRequest(token, profile.id);
      setRelationship(out?.status === 'incoming_pending' ? 'incoming_pending' : 'outgoing_pending');
      toast.success('友達申請を送信しました');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '失敗しました');
    }
  };

  const handleAccept = async () => {
    if (!token || !profile?.id) return;
    try {
      await apiClient.friendAccept(token, profile.id);
      setRelationship('friends');
      toast.success('承認しました');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '失敗しました');
    }
  };

  const handleCancel = async () => {
    if (!token || !profile?.id) return;
    try {
      await apiClient.friendCancelRequest(token, profile.id);
      setRelationship('none');
      toast.success('申請を取り消しました');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '失敗しました');
    }
  };

  const handleReject = async () => {
    if (!token || !profile?.id) return;
    try {
      await apiClient.friendReject(token, profile.id);
      setRelationship('none');
      toast.success('削除しました');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '失敗しました');
    }
  };

  const handleRemove = async () => {
    if (!token || !profile?.id) return;
    try {
      await apiClient.friendRemove(token, profile.id);
      setRelationship('none');
      toast.success('友達を解除しました');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '失敗しました');
    }
  };

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

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">プロフィール</h1>
        <p className="text-sm text-gray-500">アカウント情報</p>
      </div>

      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{profile?.name ?? '—'}</h2>
              <div className="space-y-3 text-[15px] text-gray-600 inline-block text-left">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{profile?.emailVisible && profile?.email ? profile.email : '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{profile?.location ?? '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>参加: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {profile?.bio ? (
            <div className="mb-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
              {profile.bio}
            </div>
          ) : null}

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">お気に入りのスポーツ</h3>
            <div className="flex flex-wrap gap-2 mt-4">
              {sports.map((sport: string, index: number) => (
                <span
                  key={`${sport}-${index}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${sportStyle(index)}`}
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>

          {profile?.id && profile.id !== me?.id ? (
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {relationship === 'friends' ? (
                <>
                  <button type="button" className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700" disabled>
                    友達
                  </button>
                  <button type="button" className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50" onClick={handleRemove}>
                    友達解除
                  </button>
                </>
              ) : relationship === 'outgoing_pending' ? (
                <>
                  <button type="button" className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700" disabled>
                    申請中
                  </button>
                  <button type="button" className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50" onClick={handleCancel}>
                    申請を取り消す
                  </button>
                </>
              ) : relationship === 'incoming_pending' ? (
                <>
                  <button type="button" className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white font-semibold hover:bg-blue-700" onClick={handleAccept}>
                    承認
                  </button>
                  <button type="button" className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50" onClick={handleReject}>
                    削除
                  </button>
                </>
              ) : (
                <button type="button" className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm text-white font-semibold hover:bg-blue-700" onClick={handleAddFriend}>
                  友達追加
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
