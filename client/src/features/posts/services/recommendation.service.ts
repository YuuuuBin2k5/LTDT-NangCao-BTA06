/**
 * Service for AI/ML recommendation features
 */
import { apiClient } from '../../../services/api/client';
import type { Post } from '../types/post.types';

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface TrackInteractionRequest {
  postId: number;
  interactionType: 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE' | 'SAVE';
  durationSeconds?: number;
}

class RecommendationService {
  /**
   * Get personalized "For You" feed
   */
  async getForYouFeed(page: number = 0, size: number = 20): Promise<PagedResponse<Post>> {
    const response = await apiClient.get<PagedResponse<Post>>('/recommendations/for-you', {
      params: { page, size },
    });
    return response.data;
  }

  /**
   * Get discovery feed (posts outside user's network)
   */
  async getDiscoveryFeed(
    latitude?: number,
    longitude?: number,
    page: number = 0,
    size: number = 20
  ): Promise<PagedResponse<Post>> {
    const response = await apiClient.get<PagedResponse<Post>>('/recommendations/discovery', {
      params: { latitude, longitude, page, size },
    });
    return response.data;
  }

  /**
   * Track user interaction with post
   */
  async trackInteraction(data: TrackInteractionRequest): Promise<void> {
    await apiClient.post('/recommendations/track', data);
  }

  /**
   * Get recommendation reason for a post
   */
  async getRecommendationReason(postId: number): Promise<string> {
    const response = await apiClient.get<string>(`/recommendations/reason/${postId}`);
    return response.data;
  }
}

export const recommendationService = new RecommendationService();
