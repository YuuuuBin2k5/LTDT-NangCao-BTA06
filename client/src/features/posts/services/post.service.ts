/**
 * Post API service
 */
import { apiClient } from '../../../services/api/client';
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
  CreateCommentRequest,
  UserSummary,
  Hashtag,
} from '../types/post.types';
import type { FeedParams, FeedResponse } from '../types/filter.types';

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
}

class PostService {
  /**
   * Create a new post
   */
  async createPost(request: CreatePostRequest): Promise<Post> {
    console.log('Creating post with request:', request);
    try {
      const response = await apiClient.post<Post>('/posts', request);
      console.log('Create post response:', response);
      return response;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }

  /**
   * Get post by ID
   */
  async getPost(id: number): Promise<Post> {
    return await apiClient.get<Post>(`/posts/${id}`);
  }

  /**
   * Update post
   */
  async updatePost(id: number, request: UpdatePostRequest): Promise<Post> {
    return await apiClient.put<Post>(`/posts/${id}`, request);
  }

  /**
   * Delete post
   */
  async deletePost(id: number): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  }

  /**
   * Get nearby posts
   */
  async getNearbyPosts(
    latitude: number,
    longitude: number,
    radius: number = 5.0
  ): Promise<Post[]> {
    return await apiClient.get<Post[]>('/posts/nearby', {
      params: { latitude, longitude, radius },
    });
  }

  /**
   * Get feed posts (from friends) - legacy method
   */
  async getFeedPosts(page: number = 0, size: number = 20): Promise<PaginatedResponse<Post>> {
    return await apiClient.get<PaginatedResponse<Post>>('/posts/feed', {
      params: { page, size },
    });
  }

  /**
   * Get feed posts with filters
   */
  async getFeedWithFilters(params: FeedParams): Promise<FeedResponse> {
    // Build query parameters
    const queryParams: Record<string, any> = {
      page: params.page,
      size: params.size,
      sortBy: params.sortBy || 'recent',
    };

    // Add filter parameters
    params.filters.forEach(filter => {
      switch (filter.type) {
        case 'SOCIAL':
          queryParams.socialFilter = filter.value;
          break;
        case 'LOCATION':
          queryParams.locationFilter = filter.value;
          if (filter.params?.radius) {
            queryParams.radius = filter.params.radius;
          }
          break;
        case 'CONTENT':
          queryParams.contentFilter = filter.value;
          break;
        case 'TIME':
          queryParams.timeFilter = filter.value;
          if (filter.params?.startDate) {
            queryParams.startDate = filter.params.startDate;
          }
          if (filter.params?.endDate) {
            queryParams.endDate = filter.params.endDate;
          }
          break;
        case 'ENGAGEMENT':
          queryParams.engagementFilter = filter.value;
          break;
        case 'RECOMMENDATION':
          queryParams.recommendationFilter = filter.value;
          break;
      }
    });

    // Add location context
    if (params.latitude !== undefined) {
      queryParams.latitude = params.latitude;
    }
    if (params.longitude !== undefined) {
      queryParams.longitude = params.longitude;
    }
    if (params.radius !== undefined) {
      queryParams.radius = params.radius;
    }

    return await apiClient.get<FeedResponse>('/posts/feed', {
      params: queryParams,
    });
  }

  /**
   * Get posts by user
   */
  async getUserPosts(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<Post>> {
    return await apiClient.get<PaginatedResponse<Post>>(`/posts/user/${userId}`, {
      params: { page, size },
    });
  }

  /**
   * Get posts by hashtag
   */
  async getPostsByHashtag(
    hashtag: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<Post>> {
    return await apiClient.get<PaginatedResponse<Post>>(`/posts/hashtag/${hashtag}`, {
      params: { page, size },
    });
  }

  /**
   * Get user's post count
   */
  async getUserPostCount(userId: string): Promise<number> {
    return await apiClient.get<number>(`/posts/user/${userId}/count`);
  }

  /**
   * Like a post
   */
  async likePost(postId: number): Promise<void> {
    await apiClient.post(`/posts/${postId}/like`);
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: number): Promise<void> {
    await apiClient.delete(`/posts/${postId}/like`);
  }

  /**
   * Get users who liked a post
   */
  async getLikes(postId: number, page: number = 0, size: number = 20): Promise<PaginatedResponse<UserSummary>> {
    return await apiClient.get<PaginatedResponse<UserSummary>>(`/posts/${postId}/likes`, {
      params: { page, size },
    });
  }

  /**
   * Check if user liked a post
   */
  async isPostLiked(postId: number): Promise<boolean> {
    return await apiClient.get<boolean>(`/posts/${postId}/liked`);
  }

  /**
   * Add comment to post
   */
  async addComment(postId: number, request: CreateCommentRequest): Promise<Comment> {
    return await apiClient.post<Comment>(`/posts/${postId}/comments`, request);
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: number, page: number = 0, size: number = 20): Promise<PaginatedResponse<Comment>> {
    return await apiClient.get<PaginatedResponse<Comment>>(`/posts/${postId}/comments`, {
      params: { page, size },
    });
  }

  /**
   * Update comment
   */
  async updateComment(commentId: number, request: CreateCommentRequest): Promise<Comment> {
    return await apiClient.put<Comment>(`/posts/comments/${commentId}`, request);
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/posts/comments/${commentId}`);
  }

  /**
   * Get trending hashtags
   */
  async getTrendingHashtags(page: number = 0, size: number = 20): Promise<PaginatedResponse<Hashtag>> {
    return await apiClient.get<PaginatedResponse<Hashtag>>('/hashtags/trending', {
      params: { page, size },
    });
  }

  /**
   * Get top N trending hashtags
   */
  async getTopTrendingHashtags(limit: number = 10): Promise<Hashtag[]> {
    return await apiClient.get<Hashtag[]>('/hashtags/top', {
      params: { limit },
    });
  }

  /**
   * Search hashtags by prefix
   */
  async searchHashtags(query: string, limit: number = 10): Promise<Hashtag[]> {
    return await apiClient.get<Hashtag[]>('/hashtags/search', {
      params: { q: query, limit },
    });
  }
}

export const postService = new PostService();
