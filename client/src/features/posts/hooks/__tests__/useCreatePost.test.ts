/**
 * Tests for useCreatePost hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCreatePost } from '../useCreatePost';
import { postService } from '../../services/post.service';
import { imageService } from '../../services/image.service';
import { offlineQueueService } from '../../services/offline-queue.service';
import { useNetwork } from '../../../../shared/contexts/NetworkContext';
import type { Post, PostPrivacy } from '../../types/post.types';

// Mock dependencies
jest.mock('../../services/post.service', () => ({
  postService: {
    createPost: jest.fn(),
  },
}));

jest.mock('../../services/image.service', () => ({
  imageService: {
    uploadMultipleImages: jest.fn(),
  },
}));

jest.mock('../../services/offline-queue.service', () => ({
  offlineQueueService: {
    enqueue: jest.fn(),
  },
}));

jest.mock('../../../../shared/contexts/NetworkContext', () => ({
  useNetwork: jest.fn(),
}));

describe('useCreatePost', () => {
  const mockPost: Post = {
    id: 1,
    user: {
      id: 'user-1',
      username: 'testuser',
      nickName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    content: 'Test post',
    latitude: 10.762622,
    longitude: 106.660172,
    locationName: 'Test Location',
    privacy: 'PUBLIC' as PostPrivacy,
    images: [],
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    viewCount: 0,
    hashtags: ['test'],
    createdAt: '2026-03-07T10:00:00Z',
    updatedAt: '2026-03-07T10:00:00Z',
  };

  const mockImageUploadResults = [
    { imageUrl: 'https://example.com/image1.jpg', thumbnailUrl: 'https://example.com/thumb1.jpg' },
    { imageUrl: 'https://example.com/image2.jpg', thumbnailUrl: 'https://example.com/thumb2.jpg' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default: online state
    (useNetwork as jest.Mock).mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });

    (imageService.uploadMultipleImages as jest.Mock).mockResolvedValue(mockImageUploadResults);
    (postService.createPost as jest.Mock).mockResolvedValue(mockPost);
    (offlineQueueService.enqueue as jest.Mock).mockResolvedValue(undefined);
  });

  test('should create post successfully when online', async () => {
    const { result } = renderHook(() => useCreatePost());

    const request = {
      content: 'Test post',
      latitude: 10.762622,
      longitude: 106.660172,
      locationName: 'Test Location',
      privacy: 'PUBLIC' as PostPrivacy,
    };

    const imageUris = ['file:///image1.jpg', 'file:///image2.jpg'];

    let createdPost: Post | null = null;

    await act(async () => {
      createdPost = await result.current.createPost(request, imageUris);
    });

    // Verify images were uploaded
    expect(imageService.uploadMultipleImages).toHaveBeenCalledWith(imageUris);

    // Verify post was created with image URLs
    expect(postService.createPost).toHaveBeenCalledWith({
      ...request,
      imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    });

    // Verify post was returned
    expect(createdPost).toEqual(mockPost);
    expect(result.current.error).toBeNull();
  });

  test('should create post without images when no images provided', async () => {
    const { result } = renderHook(() => useCreatePost());

    const request = {
      content: 'Test post without images',
      latitude: 10.762622,
      longitude: 106.660172,
      privacy: 'PUBLIC' as PostPrivacy,
    };

    await act(async () => {
      await result.current.createPost(request, []);
    });

    // Verify no image upload was attempted
    expect(imageService.uploadMultipleImages).not.toHaveBeenCalled();

    // Verify post was created with empty imageUrls
    expect(postService.createPost).toHaveBeenCalledWith({
      ...request,
      imageUrls: [],
    });
  });

  test('should queue post when offline', async () => {
    // Mock offline state
    (useNetwork as jest.Mock).mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });

    const { result } = renderHook(() => useCreatePost());

    const request = {
      content: 'Offline post',
      latitude: 10.762622,
      longitude: 106.660172,
      privacy: 'PUBLIC' as PostPrivacy,
    };

    const imageUris = ['file:///image1.jpg'];

    let createdPost: Post | null = null;

    await act(async () => {
      createdPost = await result.current.createPost(request, imageUris);
    });

    // Verify post was queued
    expect(offlineQueueService.enqueue).toHaveBeenCalledWith(request, imageUris);

    // Verify no upload or create was attempted
    expect(imageService.uploadMultipleImages).not.toHaveBeenCalled();
    expect(postService.createPost).not.toHaveBeenCalled();

    // Verify null was returned (queued)
    expect(createdPost).toBeNull();
  });

  test('should queue post when internet is not reachable', async () => {
    // Mock connected but no internet
    (useNetwork as jest.Mock).mockReturnValue({
      isConnected: true,
      isInternetReachable: false,
    });

    const { result } = renderHook(() => useCreatePost());

    const request = {
      content: 'No internet post',
      latitude: 10.762622,
      longitude: 106.660172,
      privacy: 'PUBLIC' as PostPrivacy,
    };

    await act(async () => {
      await result.current.createPost(request, []);
    });

    // Verify post was queued
    expect(offlineQueueService.enqueue).toHaveBeenCalled();
    expect(postService.createPost).not.toHaveBeenCalled();
  });

  test('should handle image upload errors', async () => {
    const uploadError = new Error('Upload failed');
    (imageService.uploadMultipleImages as jest.Mock).mockRejectedValue(uploadError);

    const { result } = renderHook(() => useCreatePost());

    const request = {
      content: 'Test post',
      latitude: 10.762622,
      longitude: 106.660172,
      privacy: 'PUBLIC' as PostPrivacy,
    };

    const imageUris = ['file:///image1.jpg'];

    let createdPost: Post | null = null;

    await act(async () => {
      createdPost = await result.current.createPost(request, imageUris);
    });

    // Verify error was set
    expect(result.current.error).toEqual(uploadError);
    expect(createdPost).toBeNull();

    // Verify post creation was not attempted
    expect(postService.createPost).not.toHaveBeenCalled();
  });

  test('should handle post creation errors', async () => {
    const createError = new Error('Create failed');
    (postService.createPost as jest.Mock).mockRejectedValue(createError);

    const { result } = renderHook(() => useCreatePost());

    const request = {
      content: 'Test post',
      latitude: 10.762622,
      longitude: 106.660172,
      privacy: 'PUBLIC' as PostPrivacy,
    };

    let createdPost: Post | null = null;

    await act(async () => {
      createdPost = await result.current.createPost(request, []);
    });

    // Verify error was set
    expect(result.current.error).toEqual(createError);
    expect(createdPost).toBeNull();
  });

  test('should set loading state correctly during operation', async () => {
    const { result } = renderHook(() => useCreatePost());

    expect(result.current.isLoading).toBe(false);

    const request = {
      content: 'Test post',
      latitude: 10.762622,
      longitude: 106.660172,
      privacy: 'PUBLIC' as PostPrivacy,
    };

    // Create post
    await act(async () => {
      await result.current.createPost(request, []);
    });

    // Should not be loading after completion
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle isInternetReachable being null (unknown state)', async () => {
    const { result } = renderHook(() => useCreatePost(), {
      wrapper: ({ children }) => {
        // Mock the network context for this test
        (useNetwork as jest.Mock).mockReturnValue({
          isConnected: true,
          isInternetReachable: null,
        });
        return children;
      },
    });

    const request = {
      content: 'Test post',
      latitude: 10.762622,
      longitude: 106.660172,
      privacy: 'PUBLIC' as PostPrivacy,
    };

    await act(async () => {
      await result.current.createPost(request, []);
    });

    // Should proceed with creation when internet state is unknown
    expect(postService.createPost).toHaveBeenCalled();
    expect(offlineQueueService.enqueue).not.toHaveBeenCalled();
  });
});
