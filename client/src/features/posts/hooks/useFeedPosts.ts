/**
 * Hook for fetching feed posts with filter support
 */
import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/post.service';
import { eventEmitter, AppEvents } from '../../../shared/utils/events.utils';
import type { Post } from '../types/post.types';
import type { FilterConfig, FeedResponse } from '../types/filter.types';

export interface UseFeedPostsOptions {
  filters?: FilterConfig[];
  sortBy?: 'recent' | 'popular' | 'recommended';
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export const useFeedPosts = (options: UseFeedPostsOptions = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const loadPosts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      console.log('[Feed] Loading posts:', { pageNum, append, filters: options.filters });
      
      const response: FeedResponse = await postService.getFeedWithFilters({
        page: pageNum,
        size: 20,
        filters: options.filters || [],
        sortBy: options.sortBy || 'recent',
        latitude: options.latitude,
        longitude: options.longitude,
        radius: options.radius,
      });
      
      // Server may return Page<Post> {content,[]} or plain Post[] — handle both
      const raw = response as any;
      const content: Post[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : [];
      const isLast: boolean = raw?.last ?? true;
      const total: number = raw?.totalElements ?? content.length;

      console.log('[Feed] Loaded posts:', { count: content.length, total });

      if (append) {
        setPosts(prev => [...prev, ...content]);
      } else {
        setPosts(content);
      }

      setHasMore(!isLast);
      setTotalElements(total);
      setPage(pageNum);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load feed posts:', err);
      
      // Log more details for 403 errors
      if (err instanceof Error && err.message.includes('403')) {
        console.error('[Feed] 403 Error - Authentication issue. Check if server is running and token is valid.');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [options.filters, options.sortBy, options.latitude, options.longitude, options.radius]);

  // Reload when filters change
  useEffect(() => {
    loadPosts(0, false);
  }, [options.filters, options.sortBy]);

  // Listen for new posts
  useEffect(() => {
    const unsubscribe = eventEmitter.on(AppEvents.POST_CREATED, () => {
      // Refresh feed when a new post is created
      loadPosts(0, false);
    });

    return unsubscribe;
  }, [loadPosts]);

  const refresh = useCallback(() => {
    return loadPosts(0, false);
  }, [loadPosts]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadPosts(page + 1, true);
    }
  }, [isLoadingMore, hasMore, page, loadPosts]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalElements,
    refresh,
    loadMore,
  };
};
