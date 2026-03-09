/**
 * Hook for post interactions (like, comment) with optimistic updates
 */
import { useState, useCallback } from 'react';
import { postService } from '../services/post.service';
import type { Comment, CreateCommentRequest } from '../types/post.types';

interface OptimisticUpdate {
  type: 'like' | 'unlike';
  timestamp: number;
}

export const usePostInteractions = (postId: number) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [optimisticUpdate, setOptimisticUpdate] = useState<OptimisticUpdate | null>(null);

  /**
   * Like a post with optimistic update
   */
  const likePost = useCallback(async (): Promise<boolean> => {
    setIsLiking(true);
    setError(null);
    
    // Optimistic update
    setOptimisticUpdate({ type: 'like', timestamp: Date.now() });

    try {
      await postService.likePost(postId);
      setOptimisticUpdate(null);
      return true;
    } catch (err) {
      // Rollback on error
      setOptimisticUpdate(null);
      setError(err as Error);
      console.error('Failed to like post:', err);
      return false;
    } finally {
      setIsLiking(false);
    }
  }, [postId]);

  /**
   * Unlike a post with optimistic update
   */
  const unlikePost = useCallback(async (): Promise<boolean> => {
    setIsLiking(true);
    setError(null);
    
    // Optimistic update
    setOptimisticUpdate({ type: 'unlike', timestamp: Date.now() });

    try {
      await postService.unlikePost(postId);
      setOptimisticUpdate(null);
      return true;
    } catch (err) {
      // Rollback on error
      setOptimisticUpdate(null);
      setError(err as Error);
      console.error('Failed to unlike post:', err);
      return false;
    } finally {
      setIsLiking(false);
    }
  }, [postId]);

  /**
   * Toggle like status with optimistic update
   */
  const toggleLike = useCallback(async (isLiked: boolean): Promise<boolean> => {
    if (isLiked) {
      return unlikePost();
    } else {
      return likePost();
    }
  }, [likePost, unlikePost]);

  /**
   * Add comment
   */
  const addComment = useCallback(async (
    content: string
  ): Promise<Comment | null> => {
    setIsCommenting(true);
    setError(null);

    try {
      const comment = await postService.addComment(postId, { content });
      return comment;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to add comment:', err);
      return null;
    } finally {
      setIsCommenting(false);
    }
  }, [postId]);

  /**
   * Delete comment
   */
  const deleteComment = useCallback(async (commentId: number): Promise<boolean> => {
    setError(null);

    try {
      await postService.deleteComment(commentId);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to delete comment:', err);
      return false;
    }
  }, []);

  return {
    likePost,
    unlikePost,
    toggleLike,
    addComment,
    deleteComment,
    isLiking,
    isCommenting,
    error,
    optimisticUpdate,
  };
};
