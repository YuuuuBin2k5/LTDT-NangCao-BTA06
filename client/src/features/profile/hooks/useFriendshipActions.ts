import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { friendshipService } from '../../../services/friendship/friendship.service';
import { AppError } from '../../../shared/types/error.types';

/**
 * Hook return type
 */
export interface UseFriendshipActionsReturn {
  sendFriendRequest: (userId: number) => Promise<void>;
  cancelRequest: (friendshipId: number) => Promise<void>;
  unfriend: (friendshipId: number) => Promise<void>;
  acceptRequest: (friendshipId: number) => Promise<void>;
  rejectRequest: (friendshipId: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing friendship actions
 * Handles sending friend requests, canceling requests, and unfriending
 * Provides loading state management and toast notifications
 * 
 * @returns UseFriendshipActionsReturn Hook state and methods
 */
export const useFriendshipActions = (): UseFriendshipActionsReturn => {
  // State management
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Send a friend request to a user
   * Shows success/failure toast notification
   * 
   * @param userId ID of the user to send friend request to
   */
  const sendFriendRequest = useCallback(async (userId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('👋 Sending friend request to user:', userId);

      // Call API to send friend request
      await friendshipService.sendFriendRequest(userId);

      // Show success notification
      Alert.alert(
        'Thành công',
        'Đã gửi lời mời kết bạn'
      );

      console.log('✅ Friend request sent successfully');
    } catch (err: any) {
      console.error('❌ Failed to send friend request:', err);

      // Set error state
      const errorObj = err instanceof AppError ? err : new Error('Failed to send friend request');
      setError(errorObj);

      // Show error notification
      Alert.alert(
        'Lỗi',
        err instanceof AppError ? err.message : 'Không thể gửi lời mời kết bạn'
      );

      // Re-throw to allow caller to handle
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancel a pending friend request
   * Shows success/failure toast notification
   * 
   * @param friendshipId ID of the friendship to cancel
   */
  const cancelRequest = useCallback(async (friendshipId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🚫 Canceling friend request:', friendshipId);

      // Call API to delete friendship
      await friendshipService.deleteFriendship(friendshipId);

      // Show success notification
      Alert.alert(
        'Thành công',
        'Đã hủy lời mời kết bạn'
      );

      console.log('✅ Friend request canceled successfully');
    } catch (err: any) {
      console.error('❌ Failed to cancel friend request:', err);

      // Set error state
      const errorObj = err instanceof AppError ? err : new Error('Failed to cancel friend request');
      setError(errorObj);

      // Show error notification
      Alert.alert(
        'Lỗi',
        err instanceof AppError ? err.message : 'Không thể hủy lời mời kết bạn'
      );

      // Re-throw to allow caller to handle
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Unfriend a user (delete accepted friendship)
   * Shows success/failure toast notification
   * 
   * @param friendshipId ID of the friendship to delete
   */
  const unfriend = useCallback(async (friendshipId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('💔 Unfriending user:', friendshipId);

      // Call API to delete friendship
      await friendshipService.deleteFriendship(friendshipId);

      // Show success notification
      Alert.alert(
        'Thành công',
        'Đã hủy kết bạn'
      );

      console.log('✅ Unfriend successful');
    } catch (err: any) {
      console.error('❌ Failed to unfriend:', err);

      // Set error state
      const errorObj = err instanceof AppError ? err : new Error('Failed to unfriend');
      setError(errorObj);

      // Show error notification
      Alert.alert(
        'Lỗi',
        err instanceof AppError ? err.message : 'Không thể hủy kết bạn'
      );

      // Re-throw to allow caller to handle
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Accept a friend request
   * Shows success/failure toast notification
   * 
   * @param friendshipId ID of the friendship to accept
   */
  const acceptRequest = useCallback(async (friendshipId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('✅ Accepting friend request:', friendshipId);

      // Call API to accept friend request
      await friendshipService.acceptFriendRequest(friendshipId);

      // Show success notification
      Alert.alert(
        'Thành công',
        'Đã chấp nhận lời mời kết bạn'
      );

      console.log('✅ Friend request accepted successfully');
    } catch (err: any) {
      console.error('❌ Failed to accept friend request:', err);

      // Set error state
      const errorObj = err instanceof AppError ? err : new Error('Failed to accept friend request');
      setError(errorObj);

      // Show error notification
      Alert.alert(
        'Lỗi',
        err instanceof AppError ? err.message : 'Không thể chấp nhận lời mời kết bạn'
      );

      // Re-throw to allow caller to handle
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reject a friend request
   * Shows success/failure toast notification
   * 
   * @param friendshipId ID of the friendship to reject
   */
  const rejectRequest = useCallback(async (friendshipId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('❌ Rejecting friend request:', friendshipId);

      // Call API to reject friend request
      await friendshipService.rejectFriendRequest(friendshipId);

      // Show success notification
      Alert.alert(
        'Thành công',
        'Đã từ chối lời mời kết bạn'
      );

      console.log('✅ Friend request rejected successfully');
    } catch (err: any) {
      console.error('❌ Failed to reject friend request:', err);

      // Set error state
      const errorObj = err instanceof AppError ? err : new Error('Failed to reject friend request');
      setError(errorObj);

      // Show error notification
      Alert.alert(
        'Lỗi',
        err instanceof AppError ? err.message : 'Không thể từ chối lời mời kết bạn'
      );

      // Re-throw to allow caller to handle
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendFriendRequest,
    cancelRequest,
    unfriend,
    acceptRequest,
    rejectRequest,
    isLoading,
    error,
  };
};
