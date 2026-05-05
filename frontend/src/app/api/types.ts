export type SpotDto = {
  id: string;
  name: string;
  address: string;
  district?: string | null;
  lat: number;
  lng: number;
  type: 'indoor' | 'outdoor';
  price?: string | null;
  hours?: string | null;
  facilities: string[];
  sports: string[];
  imageUrls: string[];
  avgRating: number;
  reviewCount: number;
  distanceKm?: number | null;
};

export type CommunityPostDto = {
  id: string;
  content: string;
  sport?: string | null;
  location?: string | null;
  time?: string | null;
  maxParticipants?: number | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string | null };
  _count?: { participants: number; likes: number; comments: number };
};

export type PostCommentDto = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string | null };
};

export type PostParticipantDto = {
  id: string;
  joinedAt: string;
  user: { id: string; name: string; avatarUrl?: string | null };
};

export type ScheduleDto = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  note?: string | null;
};

export type NotificationDto = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

