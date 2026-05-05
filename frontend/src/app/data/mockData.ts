export interface Location {
  id: string;
  name: string;
  nameVi: string;
  type: 'gym' | 'park' | 'pool' | 'track';
  rating: number;
  distance: number;
  price: string;
  indoor: boolean;
  image: string;
  lat: number;
  lng: number;
  aqi: number;
  temperature: number;
  crowdLevel: 'low' | 'medium' | 'high';
  facilities: string[];
  reviews: Review[];
  sportTypes: string[]; // Sports available at this location
  district: string; // District name
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface WorkoutVideo {
  id: string;
  title: string;
  titleVi: string;
  category: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  instructor: string;
  instructorVi: string;
  description: string;
  descriptionVi: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  difficultyVi: string;
  calories: number;
}

export interface UserProfile {
  id: string;
  userName: string;
  userNameVi: string;
  avatar: string;
  bio: string;
  bioVi: string;
  location: string;
  age: number;
  favoriteSports: string[];
  totalWorkouts: number;
  joinedDate: string;
  isPublic: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  time: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  time: string;
  participants: number;
  maxParticipants: number;
  locationId: string;
  locationName: string;
  locationNameVi: string;
  sportType: string;
  scheduledTime: string;
  comments: Comment[];
  likes: number;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  lastActivity: string;
  totalWorkouts: number;
}

export const currentAQI = {
  value: 85,
  status: 'moderate' as const,
  statusJa: '普通',
  statusVi: 'Trung bình',
  temperature: 28,
  humidity: 72,
  bestTime: '6:00–8:00',
};

export const locations: Location[] = [
  {
    id: '1',
    name: 'グリーンフィットネスジム',
    nameVi: 'Green Fitness Gym',
    type: 'gym',
    rating: 4.5,
    distance: 1.2,
    price: '300,000đ/月',
    indoor: true,
    image: 'https://images.unsplash.com/photo-1632077804406-188472f1a810?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBlcXVpcG1lbnQlMjBmaXRuZXNzfGVufDF8fHx8MTc3NDc5NDY1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lat: 21.0285,
    lng: 105.8542,
    aqi: 65,
    temperature: 26,
    crowdLevel: 'medium',
    facilities: ['シャワー', 'ロッカー', 'WiFi', '駐車場'],
    sportTypes: ['筋トレ / Tập gym', 'ヨガ / Yoga', 'ダンス / Khiêu vũ'],
    district: 'ホアンキエム区 / Hoàn Kiếm',
    reviews: [
      {
        id: '1',
        userName: '田中さん',
        rating: 5,
        comment: '清潔で設備が整っています。スタッフも親切です。',
        date: '2026-03-20',
      },
    ],
  },
  {
    id: '2',
    name: 'タイ湖公園',
    nameVi: 'Công viên Hồ Tây',
    type: 'park',
    rating: 4.8,
    distance: 2.5,
    price: '無料',
    indoor: false,
    image: 'https://images.unsplash.com/photo-1764556427410-67354e4a7c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5vaSUyMHBhcmslMjBvdXRkb29yfGVufDF8fHx8MTc3NDc5NDY1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lat: 21.0583,
    lng: 105.8192,
    aqi: 78,
    temperature: 28,
    crowdLevel: 'low',
    facilities: ['トイレ', '水飲み場', 'ベンチ'],
    sportTypes: ['ランニング / Chạy bộ', 'ウォーキング / Đi bộ', 'サイクリング / Đạp xe'],
    district: 'タイホー区 / Tây Hồ',
    reviews: [],
  },
  {
    id: '3',
    name: 'ヨガスタジオ・ハス',
    nameVi: 'Yoga Studio Sen',
    type: 'gym',
    rating: 4.9,
    distance: 0.8,
    price: '200,000đ/回',
    indoor: true,
    image: 'https://images.unsplash.com/photo-1599447421322-58abc6804fcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvJTIwaW5kb29yfGVufDF8fHx8MTc3NDc5NDY1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lat: 21.0245,
    lng: 105.8412,
    aqi: 45,
    temperature: 25,
    crowdLevel: 'low',
    facilities: ['シャワー', 'ロッカー', 'ヨガマット'],
    sportTypes: ['ヨガ / Yoga', '瞑想 / Thiền', 'ピラティス / Pilates'],
    district: 'バーディン区 / Ba Đình',
    reviews: [],
  },
  {
    id: '4',
    name: 'スカイプール＆フィットネス',
    nameVi: 'Sky Pool & Fitness',
    type: 'pool',
    rating: 4.6,
    distance: 3.1,
    price: '400,000đ/月',
    indoor: true,
    image: 'https://images.unsplash.com/photo-1680609989998-6183fcea718b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBpbmRvb3J8ZW58MXx8fHwxNzc0Nzk0NjU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lat: 21.0315,
    lng: 105.8495,
    aqi: 50,
    temperature: 27,
    crowdLevel: 'high',
    facilities: ['シャワー', 'ロッカー', 'サウナ', '駐車場'],
    sportTypes: ['水泳 / Bơi lội', 'アクアエクササイズ / Thể dục dưới nước'],
    district: 'ドンダー区 / Đống Đa',
    reviews: [],
  },
  {
    id: '5',
    name: 'ランニングトラック',
    nameVi: 'Đường chạy',
    type: 'track',
    rating: 4.3,
    distance: 1.8,
    price: '無料',
    indoor: false,
    image: 'https://images.unsplash.com/photo-1765261578675-529fe6c160a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwdHJhY2slMjBvdXRkb29yfGVufDF8fHx8MTc3NDY4MjE4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    lat: 21.0195,
    lng: 105.8385,
    aqi: 82,
    temperature: 29,
    crowdLevel: 'medium',
    facilities: ['トイレ', '水飲み場', '照明'],
    sportTypes: ['ランニング / Chạy bộ', 'ウォーキング / Đi bộ'],
    district: 'ホアンキエム区 / Hoàn Kiếm',
    reviews: [],
  },
  {
    id: '6',
    name: '武道館ハノイ',
    nameVi: 'Võ Đường Hà Nội',
    type: 'gym',
    rating: 4.7,
    distance: 2.3,
    price: '250,000đ/月',
    indoor: true,
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJ0aWFsJTIwYXJ0cyUyMGRvam98ZW58MXx8fHwxNzQyNjI1NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    lat: 21.0220,
    lng: 105.8350,
    aqi: 60,
    temperature: 27,
    crowdLevel: 'medium',
    facilities: ['シャワー', 'ロッカー', '更衣室', '駐車場'],
    sportTypes: ['空手 / Karate', '柔道 / Judo', 'テコンドー / Taekwondo', '武術 / Võ thuật'],
    district: 'バーディン区 / Ba Đình',
    reviews: [],
  },
  {
    id: '7',
    name: 'テニスクラブ・ロータス',
    nameVi: 'Tennis Club Lotus',
    type: 'park',
    rating: 4.4,
    distance: 2.8,
    price: '150,000đ/時間',
    indoor: false,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW5uaXMlMjBjb3VydHxlbnwxfHx8fDE3NDI2MjU2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lat: 21.0450,
    lng: 105.8200,
    aqi: 75,
    temperature: 30,
    crowdLevel: 'low',
    facilities: ['トイレ', '水飲み場', 'ベンチ', '照明'],
    sportTypes: ['テニス / Tennis', 'バドミントン / Cầu lông'],
    district: 'タイホー区 / Tây Hồ',
    reviews: [],
  },
  {
    id: '8',
    name: 'ムエタイジムVN',
    nameVi: 'Muay Thai Gym VN',
    type: 'gym',
    rating: 4.6,
    distance: 1.5,
    price: '280,000đ/月',
    indoor: true,
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdWF5JTIwdGhhaSUyMGd5bXxlbnwxfHx8fDE3NDI2MjU2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lat: 21.0180,
    lng: 105.8420,
    aqi: 55,
    temperature: 26,
    crowdLevel: 'high',
    facilities: ['シャワー', 'ロッカー', 'リング', '駐車場'],
    sportTypes: ['ムエタイ / Muay Thai', 'キックボクシング / Kickboxing', 'ボクシング / Boxing'],
    district: 'ホアンキエム区 / Hoàn Kiếm',
    reviews: [],
  },
  {
    id: '9',
    name: 'バスケットコート',
    nameVi: 'Sân bóng rổ',
    type: 'park',
    rating: 4.2,
    distance: 2.0,
    price: '無料',
    indoor: false,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY291cnQlMjBvdXRkb29yfGVufDF8fHx8MTc0MjYyNTYwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    lat: 21.0280,
    lng: 105.8470,
    aqi: 80,
    temperature: 29,
    crowdLevel: 'medium',
    facilities: ['トイレ', '水飲み場', 'ベンチ'],
    sportTypes: ['バスケットボール / Bóng rổ', 'ストリートボール / Street ball'],
    district: 'ドンダー区 / Đống Đa',
    reviews: [],
  },
  {
    id: '10',
    name: 'クライミングジム・ピーク',
    nameVi: 'Climbing Gym Peak',
    type: 'gym',
    rating: 4.8,
    distance: 2.6,
    price: '350,000đ/月',
    indoor: true,
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBjbGltYmluZyUyMGd5bXxlbnwxfHx8fDE3NDI2MjU2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    lat: 21.0330,
    lng: 105.8510,
    aqi: 48,
    temperature: 25,
    crowdLevel: 'low',
    facilities: ['シャワー', 'ロッカー', 'レンタル装備', 'WiFi'],
    sportTypes: ['ボルダリング / Bouldering', 'ロッククライミング / Rock climbing'],
    district: 'ドンダー区 / Đống Đa',
    reviews: [],
  },
];

export const workoutVideos: WorkoutVideo[] = [
  {
    id: '1',
    title: '朝のストレッチ',
    titleVi: 'Khởi động buổi sáng',
    category: 'ストレッチ',
    duration: '15分',
    thumbnail: 'https://images.unsplash.com/photo-1599447421322-58abc6804fcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvJTIwaW5kb29yfGVufDF8fHx8MTc3NDc5NDY1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: '田中さん',
    instructorVi: 'Nguyễn Văn A',
    description: '朝のストレッチは体を準備し、運動を安全に行うのに役立ちます。',
    descriptionVi: 'Khởi động buổi sáng giúp chuẩn bị cơ thể và thực hiện các bài tập an toàn.',
    difficulty: 'beginner',
    difficultyVi: 'Dễ',
    calories: 50,
  },
  {
    id: '2',
    title: '室内有酸素運動',
    titleVi: 'Cardio trong nhà',
    category: '有酸素',
    duration: '30分',
    thumbnail: 'https://images.unsplash.com/photo-1561579890-3ace74d8e378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMGdyb3VwfGVufDF8fHx8MTc3NDc5NDY1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: '佐藤さん',
    instructorVi: 'Nguyễn Thị B',
    description: '室内有酸素運動は心臓と肺を強化し、エネルギーを高めます。',
    descriptionVi: 'Cardio trong nhà giúp cải thiện sức khỏe tim phổi và tăng năng lượng.',
    difficulty: 'intermediate',
    difficultyVi: 'Trung cấp',
    calories: 150,
  },
  {
    id: '3',
    title: 'ヨガ初心者向け',
    titleVi: 'Yoga cho người mới',
    category: 'ヨガ',
    duration: '20分',
    thumbnail: 'https://images.unsplash.com/photo-1599447421322-58abc6804fcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvJTIwaW5kb29yfGVufDF8fHx8MTc3NDc5NDY1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: '伊藤さん',
    instructorVi: 'Nguyễn Văn C',
    description: 'ヨガ初心者向けのクラスは、柔軟性と集中力を向上させます。',
    descriptionVi: 'Lớp Yoga cho người mới giúp cải thiện độ linh hoạt và sự tập trung.',
    difficulty: 'beginner',
    difficultyVi: 'Dễ',
    calories: 100,
  },
  {
    id: '4',
    title: '筋力トレーニング',
    titleVi: 'Tập cơ bắp',
    category: '筋トレ',
    duration: '25分',
    thumbnail: 'https://images.unsplash.com/photo-1632077804406-188472f1a810?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBlcXVpcG1lbnQlMjBmaXRuZXNzfGVufDF8fHx8MTc3NDc5NDY1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructor: '高橋さん',
    instructorVi: 'Nguyễn Thị D',
    description: '筋力トレーニングは筋肉を強化し、骨密度を向上させます。',
    descriptionVi: 'Tập cơ bắp giúp cải thiện sức mạnh cơ bắp và mật độ xương.',
    difficulty: 'advanced',
    difficultyVi: 'Khó',
    calories: 200,
  },
];

export const userProfiles: UserProfile[] = [
  {
    id: 'user1',
    userName: '山田健太',
    userNameVi: 'Yamada Kenta',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
    bio: 'ランニングとヨガが大好きです。一緒に楽しく運動しましょう！',
    bioVi: 'Tôi yêu thích chạy bộ và yoga. Hãy cùng tập luyện vui vẻ nhé!',
    location: 'ホアンキエム区 / Hoàn Kiếm',
    age: 28,
    favoriteSports: ['ランニング / Chạy bộ', 'ヨガ / Yoga', '筋トレ / Tập gym'],
    totalWorkouts: 156,
    joinedDate: '2025-01-15',
    isPublic: true,
  },
  {
    id: 'user2',
    userName: '佐藤美咲',
    userNameVi: 'Sato Misaki',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    bio: 'ヨガインストラクター。健康的なライフスタイルを大切にしています。',
    bioVi: 'Huấn luyện viên Yoga. Tôi trân trọng lối sống lành mạnh.',
    location: 'バーディン区 / Ba Đình',
    age: 26,
    favoriteSports: ['ヨガ / Yoga', 'ピラティス / Pilates', '瞑想 / Thiền'],
    totalWorkouts: 234,
    joinedDate: '2024-11-20',
    isPublic: true,
  },
  {
    id: 'user3',
    userName: 'Nguyễn Văn An',
    userNameVi: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    bio: 'Đam mê các môn võ thuật và thể thao đồng đội. 武道とチームスポーツが大好きです。',
    bioVi: 'Đam mê các môn võ thuật và thể thao đồng đội.',
    location: 'タイホー区 / Tây Hồ',
    age: 32,
    favoriteSports: ['武術 / Võ thuật', 'バスケットボール / Bóng rổ', 'テニス / Tennis'],
    totalWorkouts: 189,
    joinedDate: '2024-09-10',
    isPublic: true,
  },
  {
    id: 'user4',
    userName: '田中花子',
    userNameVi: 'Tanaka Hanako',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    bio: '水泳とクライミングが趣味です。新しい友達を作りたいです！',
    bioVi: 'Tôi thích bơi lội và leo núi. Muốn kết bạn mới!',
    location: 'ドンダー区 / Đống Đa',
    age: 24,
    favoriteSports: ['水泳 / Bơi lội', 'ボルダリング / Bouldering', 'ランニング / Chạy bộ'],
    totalWorkouts: 98,
    joinedDate: '2025-02-01',
    isPublic: true,
  },
];

export const communityPosts: CommunityPost[] = [
  {
    id: '1',
    userId: 'user1',
    userName: '山田健太',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
    content: '明日の朝6時からタイ湖公園でランニングしませんか？初心者の方も大歓迎です。一緒に朝の爽やかな空気を楽しみましょう！',
    time: '2時間前',
    participants: 3,
    maxParticipants: 5,
    locationId: '2',
    locationName: 'タイ湖公園',
    locationNameVi: 'Công viên Hồ Tây',
    sportType: 'ランニング / Chạy bộ',
    scheduledTime: '明日 6:00 AM',
    likes: 12,
    comments: [
      {
        id: 'c1',
        userId: 'user2',
        userName: '佐藤美咲',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        content: '参加したいです！初心者でも大丈夫ですか？',
        time: '1時間前',
      },
      {
        id: 'c2',
        userId: 'user1',
        userName: '山田健太',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
        content: 'もちろんです！ゆっくりペースで走りますので安心してください。',
        time: '45分前',
      },
    ],
  },
  {
    id: '2',
    userId: 'user2',
    userName: '佐藤美咲',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    content: 'ヨガ Studio Senで毎週日曜日の朝ヨガクラスを開催しています。初心者の方も大歓迎！一緒にリラックスしましょう🧘‍♀️',
    time: '5時間前',
    participants: 2,
    maxParticipants: 6,
    locationId: '3',
    locationName: 'ヨガスタジオ・ハス',
    locationNameVi: 'Yoga Studio Sen',
    sportType: 'ヨガ / Yoga',
    scheduledTime: '毎週日曜 7:30 AM',
    likes: 18,
    comments: [
      {
        id: 'c3',
        userId: 'user4',
        userName: '田中花子',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        content: '素晴らしい！次の日曜日に参加させていただきます。',
        time: '3時間前',
      },
    ],
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    content: '週末にバスケットボールをする仲間を募集しています！経験者歓迎、でも初心者も大丈夫です。楽しくプレイしましょう🏀',
    time: '1日前',
    participants: 6,
    maxParticipants: 10,
    locationId: '9',
    locationName: 'バスケットコート',
    locationNameVi: 'Sân bóng rổ',
    sportType: 'バスケットボール / Bóng rổ',
    scheduledTime: '土曜日 4:00 PM',
    likes: 24,
    comments: [
      {
        id: 'c4',
        userId: 'user1',
        userName: '山田健太',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
        content: 'いいですね！参加したいです。何時からですか？',
        time: '18時間前',
      },
      {
        id: 'c5',
        userId: 'user3',
        userName: 'Nguyễn Văn An',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        content: '土曜日の午後4時からです。お待ちしています！',
        time: '15時間前',
      },
      {
        id: 'c6',
        userId: 'user4',
        userName: '田中花子',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        content: '初心者ですが参加してもいいですか？🙏',
        time: '12時間前',
      },
    ],
  },
  {
    id: '4',
    userId: 'user4',
    userName: '田中花子',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    content: 'クライミングジム・ピークで一緒にボルダリングをする仲間を探しています。平日の夜、誰か一緒に登りませんか？🧗‍♀️',
    time: '2日前',
    participants: 2,
    maxParticipants: 4,
    locationId: '10',
    locationName: 'クライミングジム・ピーク',
    locationNameVi: 'Climbing Gym Peak',
    sportType: 'ボルダリング / Bouldering',
    scheduledTime: '水曜日 7:00 PM',
    likes: 15,
    comments: [
      {
        id: 'c7',
        userId: 'user2',
        userName: '佐藤美咲',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        content: 'クライミング面白そう！でも初めてです。',
        time: '1日前',
      },
    ],
  },
];

export const friends: Friend[] = [
  {
    id: '1',
    name: '鈴木一郎',
    avatar: '👤',
    lastActivity: 'ランニング 5km',
    totalWorkouts: 45,
  },
  {
    id: '2',
    name: '高橋花子',
    avatar: '👤',
    lastActivity: 'ヨガ 60分',
    totalWorkouts: 32,
  },
  {
    id: '3',
    name: '伊藤太郎',
    avatar: '👤',
    lastActivity: 'ジム 90分',
    totalWorkouts: 67,
  },
];