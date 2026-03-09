/**
 * Hook for fetching nearby posts
 */
import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/post.service';
import type { Post } from '../types/post.types';

interface UseNearbyPostsOptions {
  latitude: number;
  longitude: number;
  radius?: number;
  enabled?: boolean;
}

export const useNearbyPosts = ({
  latitude,
  longitude,
  radius = 5.0,
  enabled = true,
}: UseNearbyPostsOptions) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPosts = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await postService.getNearbyPosts(latitude, longitude, radius);
      // Server may return Page<Post> {content:[...]} or plain Post[]
      const raw = data as any;
      const list: Post[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : [];
      setPosts(list);
    } catch (err) {
      setError(err as Error);
      setPosts([]); // Reset to empty array on error
      console.error('Failed to load nearby posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, radius, enabled]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const refresh = useCallback(() => {
    return loadPosts();
  }, [loadPosts]);

  return {
    posts,
    isLoading,
    error,
    refresh,
  };
};
