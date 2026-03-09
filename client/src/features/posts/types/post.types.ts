/**
 * Post-related TypeScript types
 */

export enum PostPrivacy {
  PUBLIC = 'PUBLIC',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
  PRIVATE = 'PRIVATE',
}

export interface PostImage {
  id: number;
  imageUrl: string;
  thumbnailUrl: string;
  displayOrder: number;
}

export interface UserSummary {
  id: string;
  username: string;
  nickName: string;
  avatarUrl?: string;
}

export interface Post {
  id: number;
  user: UserSummary;
  content: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  privacy: PostPrivacy;
  images: PostImage[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  viewCount: number;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  user: UserSummary;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  privacy: PostPrivacy;
  imageUrls: string[];
}

export interface UpdatePostRequest {
  content?: string;
  privacy?: PostPrivacy;
  locationName?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface Hashtag {
  id: number;
  name: string;
  usageCount: number;
}

export interface ImageUploadResult {
  imageUrl: string;
  thumbnailUrl: string;
}
