/**
 * Hook for creating posts with offline support
 */
import { useState, useCallback } from 'react';
import { postService } from '../services/post.service';
import { imageService } from '../services/image.service';
import { offlineQueueService } from '../services/offline-queue.service';
import { useNetwork } from '../../../shared/contexts/NetworkContext';
import { logger } from '../../../shared/utils/logger.utils';
import { eventEmitter, AppEvents } from '../../../shared/utils/events.utils';
import type { CreatePostRequest, Post } from '../types/post.types';

export const useCreatePost = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected, isInternetReachable } = useNetwork();

  const createPost = useCallback(async (
    request: Omit<CreatePostRequest, 'imageUrls'>,
    imageUris: string[]
  ): Promise<Post | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if online
      const isOnline = isConnected && (isInternetReachable === null || isInternetReachable);

      if (!isOnline) {
        // Queue post for later sync
        logger.info('Device offline, queueing post');
        await offlineQueueService.enqueue(request, imageUris);
        
        // Return null to indicate post was queued
        return null;
      }

      // Upload images first
      let imageUrls: string[] = [];
      if (imageUris.length > 0) {
        logger.info('Uploading images', { count: imageUris.length });
        try {
          const uploadResults = await imageService.uploadMultipleImages(imageUris);
          logger.info('Upload results', { results: uploadResults });
          
          if (!uploadResults || !Array.isArray(uploadResults)) {
            throw new Error('Invalid upload results: not an array');
          }
          
          imageUrls = uploadResults.map((result, index) => {
            if (!result || !result.imageUrl) {
              throw new Error(`Invalid upload result at index ${index}: missing imageUrl`);
            }
            return result.imageUrl;
          });
          
          logger.info('Extracted image URLs', { imageUrls });
        } catch (uploadError) {
          logger.error('Image upload failed', uploadError);
          throw new Error(`Không thể tải ảnh lên: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      // Create post with image URLs
      const post = await postService.createPost({
        ...request,
        imageUrls,
      });

      // Emit event to notify feed to refresh
      eventEmitter.emit(AppEvents.POST_CREATED, post);

      return post;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(err as Error);
      logger.error('Failed to create post', { error: errorMessage, err });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, isInternetReachable]);

  return {
    createPost,
    isLoading,
    error,
  };
};
