import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Calendar, Heart, MapPin, MessageCircle, Plus, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../api/client';
import type { CommunityPostDto, PostCommentDto, PostParticipantDto, SpotDto } from '../api/types';
import { useAuth } from '../auth/AuthContext';

function Avatar(props: { name: string; url?: string | null; size?: number; className?: string }) {
  const size = props.size ?? 40;
  const initials = props.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join('');
  return (
    <div
      className={`rounded-full bg-blue-100 text-blue-700 flex items-center justify-center overflow-hidden ${props.className ?? ''}`}
      style={{ width: size, height: size }}
    >
      {props.url ? (
        <img src={props.url} alt="avatar" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-bold">{initials || 'U'}</span>
      )}
    </div>
  );
}

export function Community() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, me } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [spots, setSpots] = useState<SpotDto[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, PostCommentDto[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const [participantsOpenFor, setParticipantsOpenFor] = useState<string | null>(null);
  const [participants, setParticipants] = useState<PostParticipantDto[]>([]);

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  const [profileOpenFor, setProfileOpenFor] = useState<string | null>(null);
  const [publicProfile, setPublicProfile] = useState<any | null>(null);
  const [relationship, setRelationship] = useState<
    'self' | 'none' | 'friends' | 'outgoing_pending' | 'incoming_pending' | null
  >(null);

  const [newPost, setNewPost] = useState({
    content: '',
    location: '',
    sport: '',
    maxParticipants: 5,
    time: '',
  });

  const spotsById = useMemo(() => {
    const m = new Map<string, SpotDto>();
    for (const s of spots) m.set(s.id, s);
    return m;
  }, [spots]);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .spots({ sort: 'rating' })
      .then((x) => {
        if (!cancelled) setSpots(x);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const loadPosts = async (kw?: string) => {
    setIsLoading(true);
    try {
      const out = await apiClient.posts(kw?.trim() ? kw.trim() : undefined, token);
      setPosts(out);
      const nextJoined: Record<string, boolean> = {};
      const nextLiked: Record<string, boolean> = {};
      for (const p of out) {
        if (typeof p.viewerJoined === 'boolean') nextJoined[p.id] = p.viewerJoined;
        if (typeof p.viewerLiked === 'boolean') nextLiked[p.id] = p.viewerLiked;
      }
      setJoined((prev) => ({ ...prev, ...nextJoined }));
      setLiked((prev) => ({ ...prev, ...nextLiked }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (!scrollTo) return;
    const el = document.getElementById(`post-${scrollTo}`);
    if (!el) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSearchParams({});
    }, 50);
  }, [searchParams, setSearchParams]);

  const toggleComments = async (postId: string) => {
    setExpandedComments((p) => ({ ...p, [postId]: !p[postId] }));
    if (comments[postId]) return;
    try {
      const out = await apiClient.postComments(postId);
      setComments((p) => ({ ...p, [postId]: out }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'コメントの読み込みに失敗しました');
    }
  };

  const openParticipants = async (postId: string) => {
    setParticipantsOpenFor(postId);
    try {
      const out = await apiClient.participants(postId);
      setParticipants(out);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '参加者の読み込みに失敗しました');
    }
  };

  const openProfile = async (userId: string) => {
    setProfileOpenFor(userId);
    try {
      const [out, rel] = await Promise.all([
        apiClient.publicUser(userId),
        token ? apiClient.friendRelationship(token, userId) : Promise.resolve({ status: 'none' as const }),
      ]);
      setPublicProfile(out);
      setRelationship(rel.status);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'プロフィールの読み込みに失敗しました');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl mb-1">コミュニティ</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          募集
        </button>
      </div>

      <div className="mb-6 flex gap-3">
        <input
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="検索…"
        />
        <button
          onClick={() => loadPosts(keyword)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
        >
          検索
        </button>
      </div>

      {isLoading ? <div className="text-sm text-gray-600">読み込み中…</div> : null}

      <div className="space-y-4">
        {posts.map((p) => {
          const spot = p.location ? spotsById.get(p.location) : undefined;
          const isLiked = liked[p.id] ?? false;
          const isJoined = joined[p.id] ?? false;
          return (
            <div
              key={p.id}
              id={`post-${p.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="text-left"
                  onClick={() => openProfile(p.user.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={p.user.name} url={p.user.avatarUrl} size={40} />
                    <div>
                      <div className="font-medium text-gray-900">{p.user.name}</div>
                      <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </button>
                <div className="text-xs text-gray-500">
                  {p.sport ? `#${p.sport}` : null}
                </div>
              </div>

              <div className="mt-3 text-gray-900">{p.content}</div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {p.time ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                    <Calendar className="w-3.5 h-3.5" /> {p.time}
                  </span>
                ) : null}
                {spot ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/location/${spot.id}?fromPost=${p.id}`)}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700"
                  >
                    <MapPin className="w-3.5 h-3.5" /> {spot.name}
                  </button>
                ) : null}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!token) return;
                      try {
                        const out = await apiClient.likePost(token, p.id);
                        setLiked((prev) => ({ ...prev, [p.id]: out.liked }));
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Like failed');
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-gray-50 ${
                      isLiked ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    {p._count?.likes ?? 0}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleComments(p.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-gray-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {p._count?.comments ?? 0}
                  </button>

                  <button
                    type="button"
                    onClick={() => openParticipants(p.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-gray-50"
                  >
                    <Users className="w-4 h-4" />
                    {p._count?.participants ?? 0}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      if (isJoined) {
                        await apiClient.leavePost(token, p.id);
                        setJoined((prev) => ({ ...prev, [p.id]: false }));
                      } else {
                        await apiClient.joinPost(token, p.id);
                        setJoined((prev) => ({ ...prev, [p.id]: true }));
                      }
                      await loadPosts(keyword);
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Join/Leave failed');
                    }
                  }}
                  className={`rounded-xl px-4 py-2 font-medium ${
                    isJoined ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isJoined ? '退出' : '参加'}
                </button>
              </div>

              {expandedComments[p.id] ? (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-3">
                  {(comments[p.id] ?? []).map((c) => (
                    <div key={c.id} className="rounded-lg bg-white p-3 border border-gray-200">
                      <div className="flex items-start gap-2">
                        <Avatar name={c.user.name} url={c.user.avatarUrl} size={32} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500">{c.user.name}</div>
                          <div className="text-sm text-gray-800">{c.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={newComment[p.id] ?? ''}
                      onChange={(e) => setNewComment((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                      placeholder="コメント…"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!token) return;
                        const content = (newComment[p.id] ?? '').trim();
                        if (!content) return;
                        try {
                          await apiClient.createComment(token, p.id, content);
                          setNewComment((prev) => ({ ...prev, [p.id]: '' }));
                          const out = await apiClient.postComments(p.id);
                          setComments((prev) => ({ ...prev, [p.id]: out }));
                          await loadPosts(keyword);
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Comment failed');
                        }
                      }}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                    >
                      送信
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-xl rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">新しい募集</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                placeholder="内容…"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={newPost.sport}
                  onChange={(e) => setNewPost((p) => ({ ...p, sport: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                  placeholder="スポーツ"
                />
                <input
                  value={newPost.time}
                  onChange={(e) => setNewPost((p) => ({ ...p, time: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                  placeholder="日時"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={newPost.location}
                  onChange={(e) => setNewPost((p) => ({ ...p, location: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
                >
                  <option value="">場所（任意）</option>
                  {spots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={newPost.maxParticipants}
                  onChange={(e) => setNewPost((p) => ({ ...p, maxParticipants: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
                  placeholder="最大人数"
                />
              </div>
              <button
                onClick={async () => {
                  if (!token) return;
                  if (!newPost.content.trim()) {
                    toast.error('内容を入力してください');
                    return;
                  }
                  try {
                    await apiClient.createPost(token, {
                      content: newPost.content.trim(),
                      sport: newPost.sport || undefined,
                      location: newPost.location || undefined,
                      time: newPost.time || undefined,
                      maxParticipants: newPost.maxParticipants || undefined,
                    });
                    toast.success('投稿しました');
                    setShowCreate(false);
                    setNewPost({ content: '', location: '', sport: '', maxParticipants: 5, time: '' });
                    await loadPosts(keyword);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Create failed');
                  }
                }}
                className="w-full rounded-2xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700"
              >
                投稿する
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {participantsOpenFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setParticipantsOpenFor(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">参加者</h2>
              <button onClick={() => setParticipantsOpenFor(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {participants.map((pp) => (
                <button key={pp.id} className="w-full text-left rounded-xl border border-gray-200 p-3 hover:bg-gray-50" onClick={() => openProfile(pp.user.id)}>
                  <div className="flex items-center gap-3">
                    <Avatar name={pp.user.name} url={pp.user.avatarUrl} size={40} />
                    <div>
                      <div className="font-medium">{pp.user.name}</div>
                      <div className="text-xs text-gray-500">{new Date(pp.joinedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </button>
              ))}
              {participants.length === 0 ? <div className="text-sm text-gray-600">参加者はいません</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {profileOpenFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setProfileOpenFor(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">ユーザー</h2>
              <button onClick={() => setProfileOpenFor(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar name={publicProfile?.name ?? 'User'} url={publicProfile?.avatarUrl} size={56} />
                <div className="min-w-0">
                  <div className="text-xl font-semibold truncate">{publicProfile?.name ?? '—'}</div>
                  <div className="text-sm text-gray-600 truncate">{publicProfile?.location ?? ''}</div>
                </div>
              </div>
              <div className="text-sm text-gray-700">{publicProfile?.bio ?? ''}</div>
              {publicProfile?.id === me?.id ? (
                <div className="pt-3">
                  <Link className="text-blue-600 underline" to="/profile">
                    自分のプロフィールへ
                  </Link>
                </div>
              ) : publicProfile?.id ? (
                <div className="pt-3 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                      onClick={() => navigate(`/users/${encodeURIComponent(publicProfile.id)}`)}
                    >
                      プロフィールを見る
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {relationship === 'friends' ? (
                      <>
                        <button
                          type="button"
                          className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700"
                          disabled
                        >
                          友達
                        </button>
                        <button
                          type="button"
                          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                          onClick={async () => {
                            if (!token) return;
                            try {
                              await apiClient.friendRemove(token, publicProfile.id);
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
                        <button
                          type="button"
                          className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700"
                          disabled
                        >
                          申請中
                        </button>
                        <button
                          type="button"
                          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                          onClick={async () => {
                            if (!token) return;
                            try {
                              await apiClient.friendCancelRequest(token, publicProfile.id);
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
                              await apiClient.friendAccept(token, publicProfile.id);
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
                              await apiClient.friendReject(token, publicProfile.id);
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
                            await apiClient.friendRequest(token, publicProfile.id);
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
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
