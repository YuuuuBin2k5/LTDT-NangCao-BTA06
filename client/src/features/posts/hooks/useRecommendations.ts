/**
 * Hook for fetching recommended posts
 */
import { useState, useCallback, useEffect } from 'react';
import { recommendationService, type PagedResponse } from '../services/recommendation.service';
import type { Post } from '../types/post.types';

interface UseRecommendationsOptions {
  type: 'for-you' | 'discovery';
  latitude?: number;
  longitude?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface UseRecommendationsReturn {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useRecommendations = ({
  type,
  latitude,
  longitude,
  pageSize = 20,
  enabled = true,
}: UseRecommendationsOptions): UseRecommendationsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(
    async (page: number, append: boolean = false) => {
      if (!enabled) return;

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        let response: PagedResponse<Post>;

        if (type === 'for-you') {
          response = await recommendationService.getForYouFeed(page, pageSize);
        } else {
          response = await recommendationService.getDiscoveryFeed(
            latitude,
            longitude,
            page,
            pageSize
          );
        }

        if (append) {
          setPosts(prev => [...prev, ...response.content]);
        } else {
          setPosts(response.content);
        }

        setHasMore(!response.last);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [type, latitude, longitude, pageSize, enabled]
  );

  const refresh = useCallback(async () => {
    await fetchPosts(0, false);
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchPosts(currentPage + 1, true);
  }, [hasMore, isLoadingMore, currentPage, fetchPosts]);

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchPosts(0, false);
    }
  }, [enabled, type, latitude, longitude]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  };
};
