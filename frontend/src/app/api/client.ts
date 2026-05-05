import { http } from './http';
import type {
  CommunityPostDto,
  NotificationDto,
  PostCommentDto,
  PostParticipantDto,
  ScheduleDto,
  SpotDto,
} from './types';

export const apiClient = {
  aqi(params?: { lat?: number; lng?: number }) {
    const search = new URLSearchParams();
    if (params?.lat != null) search.set('lat', String(params.lat));
    if (params?.lng != null) search.set('lng', String(params.lng));
    const q = search.toString();
    return http<{ aqi: number; category: string; updatedAt: string }>(`/environment/aqi${q ? `?${q}` : ''}`);
  },
  weather(params?: { lat?: number; lng?: number }) {
    const search = new URLSearchParams();
    if (params?.lat != null) search.set('lat', String(params.lat));
    if (params?.lng != null) search.set('lng', String(params.lng));
    const q = search.toString();
    return http<{ tempC: number; humidity: number; description?: string; updatedAt: string }>(
      `/environment/weather${q ? `?${q}` : ''}`,
    );
  },
  spots(params?: {
    sort?: 'rating' | 'distance';
    district?: string;
    type?: 'indoor' | 'outdoor';
    sport?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }) {
    const search = new URLSearchParams();
    if (params?.sort) search.set('sort', params.sort);
    if (params?.district) search.set('district', params.district);
    if (params?.type) search.set('type', params.type);
    if (params?.sport) search.set('sport', params.sport);
    if (params?.lat != null) search.set('lat', String(params.lat));
    if (params?.lng != null) search.set('lng', String(params.lng));
    if (params?.radiusKm != null) search.set('radiusKm', String(params.radiusKm));
    const q = search.toString();
    return http<SpotDto[]>(`/spots${q ? `?${q}` : ''}`);
  },
  spot(id: string) {
    return http<SpotDto>(`/spots/${encodeURIComponent(id)}`);
  },
  spotReviews(id: string) {
    return http<any[]>(`/spots/${encodeURIComponent(id)}/reviews`);
  },
  createReview(id: string, token: string, body: { rating: number; comment: string }) {
    return http(`/spots/${encodeURIComponent(id)}/reviews`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    });
  },
  posts(keyword?: string) {
    const q = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    return http<CommunityPostDto[]>(`/posts${q}`);
  },
  createPost(token: string, body: { content: string; sport?: string; location?: string; time?: string; maxParticipants?: number }) {
    return http('/posts', { method: 'POST', token, body: JSON.stringify(body) });
  },
  joinPost(token: string, id: string) {
    return http(`/posts/${encodeURIComponent(id)}/join`, { method: 'POST', token });
  },
  leavePost(token: string, id: string) {
    return http(`/posts/${encodeURIComponent(id)}/leave`, { method: 'POST', token });
  },
  likePost(token: string, id: string) {
    return http<{ liked: boolean }>(`/posts/${encodeURIComponent(id)}/like`, { method: 'POST', token });
  },
  postComments(id: string) {
    return http<PostCommentDto[]>(`/posts/${encodeURIComponent(id)}/comments`);
  },
  createComment(token: string, id: string, content: string) {
    return http(`/posts/${encodeURIComponent(id)}/comments`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
  },
  participants(id: string) {
    return http<PostParticipantDto[]>(`/posts/${encodeURIComponent(id)}/participants`);
  },
  schedules(token: string, month: number, year: number) {
    return http<ScheduleDto[]>(`/schedules?month=${month}&year=${year}`, { token });
  },
  createSchedule(token: string, body: { title: string; type: string; date: string; time: string; note?: string }) {
    return http<ScheduleDto>('/schedules', { method: 'POST', token, body: JSON.stringify(body) });
  },
  updateSchedule(token: string, id: string, body: Partial<{ title: string; type: string; date: string; time: string; note: string }>) {
    return http<ScheduleDto>(`/schedules/${encodeURIComponent(id)}`, { method: 'PUT', token, body: JSON.stringify(body) });
  },
  deleteSchedule(token: string, id: string) {
    return http(`/schedules/${encodeURIComponent(id)}`, { method: 'DELETE', token });
  },
  notifications(token: string) {
    return http<NotificationDto[]>('/notifications', { token });
  },
  markNotificationRead(token: string, id: string) {
    return http(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH', token });
  },
  publicUser(id: string) {
    return http<any>(`/users/${encodeURIComponent(id)}`);
  },
};
