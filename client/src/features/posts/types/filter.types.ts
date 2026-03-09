/**
 * Filter types and interfaces for feed filtering
 */

export enum FilterType {
  SOCIAL = 'SOCIAL',
  LOCATION = 'LOCATION',
  CONTENT = 'CONTENT',
  TIME = 'TIME',
  ENGAGEMENT = 'ENGAGEMENT',
  DISCOVERY = 'DISCOVERY',
  RECOMMENDATION = 'RECOMMENDATION',
}

export enum SocialFilterValue {
  FRIENDS = 'friends',
  FRIENDS_OF_FRIENDS = 'friends_of_friends',
  FOLLOWING = 'following',
  MUTUAL_FRIENDS = 'mutual_friends',
}

export enum LocationFilterValue {
  NEARBY = 'nearby',
  MY_CITY = 'my_city',
  PLACES_VISITED = 'places_visited',
  TRENDING_NEARBY = 'trending_nearby',
}

export enum ContentFilterValue {
  PHOTOS_ONLY = 'photos_only',
  POPULAR = 'popular',
  RECENT = 'recent',
  LONG_POSTS = 'long_posts',
  CHECK_INS = 'check_ins',
}

export enum TimeFilterValue {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  CUSTOM = 'custom',
}

export enum EngagementFilterValue {
  TRENDING = 'trending',
  MOST_LIKED = 'most_liked',
  MOST_DISCUSSED = 'most_discussed',
  VIRAL = 'viral',
}

export enum RecommendationFilterValue {
  FOR_YOU = 'for_you',
  DISCOVERY = 'discovery',
}

export interface FilterConfig {
  id: string;
  type: FilterType;
  value: string;
  label: string;
  params?: Record<string, any>;
}

export interface FeedParams {
  page: number;
  size: number;
  filters: FilterConfig[];
  sortBy?: 'recent' | 'popular' | 'recommended';
  latitude?: number;
  longitude?: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
}

export interface FilterSuggestion {
  filter: FilterConfig;
  reason: string;
  estimatedResults: number;
}

export interface FeedResponse {
  content: any[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  last: boolean;
  appliedFilters: FilterConfig[];
  suggestions: FilterSuggestion[];
}

export interface FilterPreset {
  id: number;
  name: string;
  description?: string;
  filters: FilterConfig[];
  isDefault: boolean;
  isPublic: boolean;
  shareToken?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresetRequest {
  name: string;
  description?: string;
  filters: FilterConfig[];
  isPublic?: boolean;
}

// Filter labels in Vietnamese
export const FILTER_LABELS: Record<string, string> = {
  // Social
  friends: 'Bạn bè',
  friends_of_friends: 'Bạn của bạn bè',
  following: 'Đang theo dõi',
  mutual_friends: 'Bạn chung',
  
  // Location
  nearby: 'Gần đây',
  my_city: 'Thành phố của tôi',
  places_visited: 'Nơi đã đến',
  trending_nearby: 'Xu hướng gần đây',
  
  // Content
  photos_only: 'Chỉ ảnh',
  popular: 'Phổ biến',
  recent: 'Gần đây',
  long_posts: 'Bài dài',
  check_ins: 'Check-in',
  
  // Time
  today: 'Hôm nay',
  this_week: 'Tuần này',
  this_month: 'Tháng này',
  custom: 'Tùy chỉnh',
  
  // Engagement
  trending: 'Xu hướng',
  most_liked: 'Nhiều thích nhất',
  most_discussed: 'Nhiều bình luận nhất',
  viral: 'Viral',
  
  // Recommendation
  for_you: 'Dành cho bạn',
  discovery: 'Khám phá',
};
