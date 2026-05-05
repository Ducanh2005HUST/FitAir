import { Users, MapPin, Clock, Plus, MessageCircle, Search, X, Heart, Send, Calendar, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { communityPosts, userProfiles, locations } from '../data/mockData';
import { useState, useEffect, useRef } from 'react';
import type { CommunityPost, UserProfile } from '../data/mockData';

export function Community() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<{ [key: string]: { userId: string, userName: string } | null }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [highlightedPost, setHighlightedPost] = useState<string | null>(null);
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [joinedPosts, setJoinedPosts] = useState<Set<string>>(new Set());
  const [participantCounts, setParticipantCounts] = useState<{ [key: string]: number }>({});
  const [showParticipantsModal, setShowParticipantsModal] = useState<string | null>(null);

  // Create post form state
  const [newPost, setNewPost] = useState({
    content: '',
    locationId: '',
    sportType: '',
    maxParticipants: 5,
    scheduledTime: '',
  });

  // Check if we need to scroll to a specific post
  useEffect(() => {
    const scrollToPostId = searchParams.get('scrollTo');
    if (scrollToPostId && postRefs.current[scrollToPostId]) {
      setTimeout(() => {
        postRefs.current[scrollToPostId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        setHighlightedPost(scrollToPostId);
        // Remove highlight after 3 seconds
        setTimeout(() => setHighlightedPost(null), 3000);
        // Clear the query param
        setSearchParams({});
      }, 100);
    }
  }, [searchParams, setSearchParams]);

  const filteredPosts = communityPosts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.sportType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const toggleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const toggleJoin = (postId: string) => {
    const newJoined = new Set(joinedPosts);
    if (newJoined.has(postId)) {
      newJoined.delete(postId);
      setParticipantCounts(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) - 1
      }));
    } else {
      newJoined.add(postId);
      setParticipantCounts(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1
      }));
    }
    setJoinedPosts(newJoined);
  };

  const handleUserClick = (userId: string) => {
    const profile = userProfiles.find(u => u.id === userId);
    if (profile) {
      setSelectedUserProfile(profile);
    }
  };

  const handleLocationClick = (locationId: string, postId: string) => {
    navigate(`/location/${locationId}?fromPost=${postId}`);
  };

  const CreatePostModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-gradient-to-br from-blue-50 to-white z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">新しい募集 / Tạo bài mới</h2>
          </div>
          <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容 / Nội dung</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="運動の詳細を書いてください / Mô tả chi tiết về hoạt động..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">場所 / Địa điểm</label>
            <select
              value={newPost.locationId}
              onChange={(e) => setNewPost({ ...newPost, locationId: e.target.value })}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください / Chọn địa điểm...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.nameVi} / {loc.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">スポーツ / Môn thể thao</label>
              <input
                type="text"
                value={newPost.sportType}
                onChange={(e) => setNewPost({ ...newPost, sportType: e.target.value })}
                placeholder="例: ランニング"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最大人数 / Số người tối đa</label>
              <input
                type="number"
                value={newPost.maxParticipants}
                onChange={(e) => setNewPost({ ...newPost, maxParticipants: parseInt(e.target.value) })}
                min="2"
                max="20"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">日時 / Thời gian</label>
            <input
              type="text"
              value={newPost.scheduledTime}
              onChange={(e) => setNewPost({ ...newPost, scheduledTime: e.target.value })}
              placeholder="例: 明日 6:00 AM"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={() => setShowCreateModal(false)}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              // Handle post creation
              setShowCreateModal(false);
              setNewPost({ content: '', locationId: '', sportType: '', maxParticipants: 5, scheduledTime: '' });
            }}
            className="flex-[2] py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-md transition-colors"
          >
            投稿する / Đăng bài
          </button>
        </div>
      </div>
    </div>
  );

  const UserProfileModal = ({ profile }: { profile: UserProfile }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedUserProfile(null)}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
          <button
            onClick={() => setSelectedUserProfile(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-6 pb-6 relative z-10">
          <div className="flex flex-col items-center -mt-16 mb-4">
            <img
              src={profile.avatar}
              alt={profile.userName}
              className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover mb-3"
            />
            <h3 className="text-xl font-bold text-gray-800">{profile.userName}</h3>
            <p className="text-sm text-gray-500 mb-1">{profile.userNameVi}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-2">{profile.bio}</p>
              <p className="text-xs text-gray-500">{profile.bioVi}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                <div className="text-xl font-bold text-purple-600">{profile.age}</div>
                <div className="text-[10px] text-gray-600">歳 / tuổi</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <div className="text-xl font-bold text-green-600">{profile.favoriteSports.length}</div>
                <div className="text-[10px] text-gray-600">スポーツ</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2">好きなスポーツ / Môn thích</h4>
              <div className="flex flex-wrap gap-2">
                {profile.favoriteSports.map((sport, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    {sport}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ParticipantsModal = ({ postId }: { postId: string }) => {
    const post = filteredPosts.find(p => p.id === postId);
    if (!post) return null;

    // Simulate participant list based on count
    const baseCount = post.participants;
    const currentCount = baseCount + (participantCounts[postId] || 0);
    
    // Make sure we have enough mock profiles, repeating if necessary
    const participantsList = Array.from({ length: currentCount }).map((_, i) => {
      // If the current user has joined, we put them first
      if (i === 0 && joinedPosts.has(postId)) {
        return {
          id: 'me',
          userName: 'あなた (Bạn)',
          userNameVi: 'You',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
          bio: '',
          bioVi: '',
          location: 'Hà Nội',
          age: 25,
          favoriteSports: [],
          totalWorkouts: 0,
          joinedDate: '',
          isPublic: true
        } as UserProfile;
      }
      
      const profileIndex = (joinedPosts.has(postId) ? i - 1 : i) % userProfiles.length;
      return userProfiles[profileIndex];
    });

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={() => setShowParticipantsModal(null)}
      >
        <div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[70vh]" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              参加者リスト / Danh sách tham gia ({currentCount})
            </h3>
            <button
              onClick={() => setShowParticipantsModal(null)}
              className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-2 overflow-y-auto space-y-1">
            {participantsList.map((user, idx) => (
              <div 
                key={`${user.id}-${idx}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                onClick={() => {
                  if (user.id !== 'me') {
                    setShowParticipantsModal(null);
                    handleUserClick(user.id);
                  }
                }}
              >
                <img 
                  src={user.avatar} 
                  alt={user.userName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <p className="font-medium text-sm text-gray-800">{user.userName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {user.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl mb-2 font-bold text-gray-800">
          コミュニティ <span className="text-blue-600">🤝</span>
        </h1>
        <p className="text-sm text-gray-600">Cộng đồng tập luyện - Tìm bạn tập cùng</p>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="活動を検索 / Tìm kiếm hoạt động, người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isHighlighted = highlightedPost === post.id;
            return (
              <div
                key={post.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                  isHighlighted 
                    ? 'border-blue-500 ring-4 ring-blue-200 animate-pulse' 
                    : 'border-gray-100'
                }`}
                ref={el => postRefs.current[post.id] = el}
              >
                {/* Post Header */}
                <div className="p-4 md:p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <button
                      onClick={() => handleUserClick(post.userId)}
                      className="flex-shrink-0 group"
                    >
                      <img
                        src={post.avatar}
                        alt={post.userName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-all group-hover:scale-105"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <button
                            onClick={() => handleUserClick(post.userId)}
                            className="font-bold text-gray-800 hover:text-blue-600 transition-colors"
                          >
                            {post.userName}
                          </button>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500">{post.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                  {/* Location & Sport Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => handleLocationClick(post.locationId, post.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200 group"
                    >
                      <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{post.locationNameVi}</span>
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium border border-purple-200">
                      <span>🏃</span>
                      <span>{post.sportType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium border border-orange-200">
                      <Calendar className="w-4 h-4" />
                      <span>{post.scheduledTime}</span>
                    </div>
                  </div>

                  {/* Participants */}
                  <div 
                    onClick={() => setShowParticipantsModal(post.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200 mb-4 w-fit cursor-pointer hover:bg-green-100 transition-colors group/participants"
                  >
                    <Users className="w-4 h-4 text-green-600 group-hover/participants:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-green-700 group-hover/participants:text-green-800">
                      {post.participants + (participantCounts[post.id] || 0)}/{post.maxParticipants} 参加者
                    </span>
                    <div className="w-full bg-green-200 rounded-full h-1.5 ml-2 min-w-[60px]">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${((post.participants + (participantCounts[post.id] || 0)) / post.maxParticipants) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                        likedPosts.has(post.id)
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-red-600' : ''}`} />
                      <span className="text-sm">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments.length}</span>
                      {expandedComments.has(post.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => toggleJoin(post.id)}
                      className={`ml-auto px-5 py-2 rounded-xl font-medium transition-all shadow-sm hover:shadow-md text-sm ${
                        joinedPosts.has(post.id)
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                      }`}
                    >
                      {joinedPosts.has(post.id) ? '参加中 ✓' : '参加する'}
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="bg-gray-50 border-t border-gray-100 p-4 md:p-5 space-y-3">
                    {/* Existing Comments */}
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 bg-white rounded-xl p-3 border border-gray-100">
                        <button
                          onClick={() => handleUserClick(comment.userId)}
                          className="flex-shrink-0"
                        >
                          <img
                            src={comment.avatar}
                            alt={comment.userName}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 hover:border-blue-500 transition-colors"
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => handleUserClick(comment.userId)}
                            className="font-medium text-sm text-gray-800 hover:text-blue-600 transition-colors"
                          >
                            {comment.userName}
                          </button>
                          <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">{comment.time}</span>
                            {comment.userId !== post.userId && (
                              <button
                                onClick={() => setReplyingTo({ ...replyingTo, [post.id]: { userId: comment.userId, userName: comment.userName } })}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                返信 / Trả lời
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex flex-col gap-2 pt-2">
                      {replyingTo[post.id] && (
                        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 mb-1">
                          <span className="text-xs text-blue-700">
                            <span className="font-semibold">{replyingTo[post.id].userName}</span> に返信中 / Đang trả lời {replyingTo[post.id].userName}
                          </span>
                          <button
                            onClick={() => setReplyingTo({ ...replyingTo, [post.id]: null })}
                            className="text-blue-400 hover:text-blue-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder={replyingTo[post.id] ? "返信を入力 / Nhập câu trả lời..." : "コメントを追加 / Thêm bình luận..."}
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newComment[post.id]?.trim()) {
                                // Handle comment submit
                                setNewComment({ ...newComment, [post.id]: '' });
                                setReplyingTo({ ...replyingTo, [post.id]: null });
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newComment[post.id]?.trim()) {
                                // Handle comment submit
                                setNewComment({ ...newComment, [post.id]: '' });
                                setReplyingTo({ ...replyingTo, [post.id]: null });
                              }
                            }}
                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto shadow-inner">
              <Search className="w-10 h-10 text-blue-400" />
            </div>
            <p className="font-bold text-gray-700 mb-1">検索結果が見つかりません</p>
            <p className="text-sm text-gray-500">Không tìm thấy kết quả phù hợp</p>
          </div>
        )}
      </div>

      {/* Create Post FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.5)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-20 group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modals */}
      {showCreateModal && <CreatePostModal />}
      {selectedUserProfile && <UserProfileModal profile={selectedUserProfile} />}
      {showParticipantsModal && <ParticipantsModal postId={showParticipantsModal} />}
    </div>
  );
}