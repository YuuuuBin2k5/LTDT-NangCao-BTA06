/**
 * Tests for usePostInteractions hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePostInteractions } from '../usePostInteractions';
import { postService } from '../../services/post.service';
import type { Comment } from '../../types/post.types';

// Mock the post service
jest.mock('../../services/post.service', () => ({
  postService: {
    likePost: jest.fn(),
    unlikePost: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

describe('usePostInteractions', () => {
  const mockComment: Comment = {
    id: 1,
    postId: 123,
    user: {
      id: 'user-1',
      username: 'testuser',
      nickName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    content: 'Test comment',
    createdAt: '2026-03-07T10:00:00Z',
    updatedAt: '2026-03-07T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (postService.likePost as jest.Mock).mockResolvedValue(undefined);
    (postService.unlikePost as jest.Mock).mockResolvedValue(undefined);
    (postService.addComment as jest.Mock).mockResolvedValue(mockComment);
    (postService.deleteComment as jest.Mock).mockResolvedValue(undefined);
  });

  describe('likePost', () => {
    test('should like post successfully', async () => {
      const { result } = renderHook(() => usePostInteractions(123));

      let success = false;

      await act(async () => {
        success = await result.current.likePost();
      });

      expect(success).toBe(true);
      expect(postService.likePost).toHaveBeenCalledWith(123);
      expect(result.current.error).toBeNull();
    });

    test('should handle like errors', async () => {
      const likeError = new Error('Like failed');
      (postService.likePost as jest.Mock).mockRejectedValue(likeError);

      const { result } = renderHook(() => usePostInteractions(123));

      let success = false;

      await act(async () => {
        success = await result.current.likePost();
      });

      expect(success).toBe(false);
      expect(result.current.error).toEqual(likeError);
    });
  });

  describe('unlikePost', () => {
    test('should unlike post successfully', async () => {
      const { result } = renderHook(() => usePostInteractions(123));

      let success = false;

      await act(async () => {
        success = await result.current.unlikePost();
      });

      expect(success).toBe(true);
      expect(postService.unlikePost).toHaveBeenCalledWith(123);
      expect(result.current.error).toBeNull();
    });

    test('should handle unlike errors', async () => {
      const unlikeError = new Error('Unlike failed');
      (postService.unlikePost as jest.Mock).mockRejectedValue(unlikeError);

      const { result } = renderHook(() => usePostInteractions(123));

      let success = false;

      await act(async () => {
        success = await result.current.unlikePost();
      });

      expect(success).toBe(false);
      expect(result.current.error).toEqual(unlikeError);
    });
  });

  describe('toggleLike', () => {
    test('should unlike when currently liked', async () => {
      const { result } = renderHook(() => usePostInteractions(123));

      await act(async () => {
        await result.current.toggleLike(true);
      });

      expect(postService.unlikePost).toHaveBeenCalledWith(123);
      expect(postService.likePost).not.toHaveBeenCalled();
    });

    test('should like when currently not liked', async () => {
      const { result } = renderHook(() => usePostInteractions(123));

      await act(async () => {
        await result.current.toggleLike(false);
      });

      expect(postService.likePost).toHaveBeenCalledWith(123);
      expect(postService.unlikePost).not.toHaveBeenCalled();
    });
  });

  describe('addComment', () => {
    test('should add comment successfully', async () => {
      const { result } = renderHook(() => usePostInteractions(123));

      let comment: Comment | null = null;

      await act(async () => {
        comment = await result.current.addComment('Test comment');
      });

      expect(comment).toEqual(mockComment);
      expect(postService.addComment).toHaveBeenCalledWith(123, { content: 'Test comment' });
      expect(result.current.error).toBeNull();
    });

    test('should handle add comment errors', async () => {
      const commentError = new Error('Comment failed');
      (postService.addComment as jest.Mock).mockRejectedValue(commentError);

      const { result } = renderHook(() => usePostInteractions(123));

      let comment: Comment | null = null;

      await act(async () => {
        comment = await result.current.addComment('Test comment');
      });

      expect(comment).toBeNull();
      expect(result.current.error).toEqual(commentError);
    });
  });

  describe('deleteComment', () => {
    test('should delete comment successfully', async () => {
      const { result } = renderHook(() => usePostInteractions(123));

      let success = false;

      await act(async () => {
        success = await result.current.deleteComment(456);
      });

      expect(success).toBe(true);
      expect(postService.deleteComment).toHaveBeenCalledWith(456);
      expect(result.current.error).toBeNull();
    });

    test('should handle delete comment errors', async () => {
      const deleteError = new Error('Delete failed');
      (postService.deleteComment as jest.Mock).mockRejectedValue(deleteError);

      const { result } = renderHook(() => usePostInteractions(123));

      let success = false;

      await act(async () => {
        success = await result.current.deleteComment(456);
      });

      expect(success).toBe(false);
      expect(result.current.error).toEqual(deleteError);
    });
  });
});
