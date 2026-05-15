export interface Location {
  id: string;
  name: string;
  // Legacy field kept for type compatibility (do not display in UI)
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
  sportTypes: string[];
  district: string;
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
  // Legacy field kept for type compatibility (do not display in UI)
  titleVi: string;
  category: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  instructor: string;
  // Legacy field kept for type compatibility (do not display in UI)
  instructorVi: string;
  description: string;
  // Legacy field kept for type compatibility (do not display in UI)
  descriptionVi: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  // Legacy field kept for type compatibility (do not display in UI)
  difficultyVi: string;
  calories: number;
}

export interface UserProfile {
  id: string;
  userName: string;
  // Legacy field kept for type compatibility (do not display in UI)
  userNameVi: string;
  avatar: string;
  bio: string;
  // Legacy field kept for type compatibility (do not display in UI)
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
  // Legacy field kept for type compatibility (do not display in UI)
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

// The app uses live API data; keep these mock exports minimal.
export const currentAQI = {
  value: 85,
  status: 'moderate' as const,
  statusJa: '普通',
  temperature: 28,
  humidity: 72,
  bestTime: '6:00–8:00',
};

export const locations: Location[] = [];
export const workoutVideos: WorkoutVideo[] = [];
export const userProfiles: UserProfile[] = [];
export const communityPosts: CommunityPost[] = [];
export const friends: Friend[] = [];

