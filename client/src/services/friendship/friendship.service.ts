import { apiClient } from '../api/client';
import { AppError } from '../../shared/types/error.types';
import { UserSearchResult, FriendshipStatus, FriendUser } from '../../shared/types/friendship.types';

/**
 * Send friend request response
 */
export interface SendFriendRequestResponse {
  id: number;
  userId1: number;
  userId2: number;
  status: FriendshipStatus;
  createdAt: string;
}

/**
 * FriendshipService interface defining friendship-related operations
 */
export interface FriendshipService {
  searchUsers(keyword: string): Promise<UserSearchResult[]>;
  sendFriendRequest(userId: number): Promise<SendFriendRequestResponse>;
  deleteFriendship(friendshipId: number): Promise<void>;
  getFriends(): Promise<FriendUser[]>;
  getFriendRequests(): Promise<FriendUser[]>;
  acceptFriendRequest(friendshipId: number): Promise<SendFriendRequestResponse>;
  rejectFriendRequest(friendshipId: number): Promise<void>;
}

/**
 * FriendshipService implementation
 */
class FriendshipServiceImpl implements FriendshipService {
  /**
   * Search for users by keyword
   * @param keyword Search keyword for name or username
   * @returns Promise<UserSearchResult[]> Array of user search results with friendship status
   * @throws AppError if API call fails
   */
  async searchUsers(keyword: string): Promise<UserSearchResult[]> {
    try {
      console.log('🔍 Searching users with keyword:', keyword);

      const response = await apiClient.get<UserSearchResult[]>(
        '/users/search',
        {
          params: { keyword },
        }
      );

      console.log('✅ User search successful:', {
        resultCount: response.length,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to search users:', {
        keyword,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      // Handle 401 specifically (authentication required)
      if (error?.status === 401) {
        throw new AppError(
          'Vui lòng đăng nhập để tìm kiếm người dùng',
          'AUTHENTICATION_REQUIRED',
          error
        );
      }

      throw new AppError(
        'Không thể tìm kiếm người dùng',
        'USER_SEARCH_ERROR',
        error
      );
    }
  }

  /**
   * Send a friend request to another user
   * @param userId ID of the user to send friend request to
   * @returns Promise<SendFriendRequestResponse> Created friendship data
   * @throws AppError if API call fails
   */
  async sendFriendRequest(userId: number): Promise<SendFriendRequestResponse> {
    try {
      console.log('👋 Sending friend request to user ID:', userId);

      const response = await apiClient.post<SendFriendRequestResponse>(
        '/friendships',
        { toUserId: userId }
      );

      console.log('✅ Friend request sent successfully:', {
        friendshipId: response.id,
        status: response.status,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to send friend request:', {
        userId,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      // Handle specific error cases
      if (error?.status === 400) {
        throw new AppError(
          'Không thể gửi lời mời kết bạn cho chính mình',
          'INVALID_FRIEND_REQUEST',
          error
        );
      }

      if (error?.status === 401) {
        throw new AppError(
          'Vui lòng đăng nhập để gửi lời mời kết bạn',
          'AUTHENTICATION_REQUIRED',
          error
        );
      }

      if (error?.status === 404) {
        throw new AppError(
          'Người dùng không tồn tại',
          'USER_NOT_FOUND',
          error
        );
      }

      if (error?.status === 409) {
        throw new AppError(
          'Lời mời kết bạn đã tồn tại',
          'DUPLICATE_FRIEND_REQUEST',
          error
        );
      }

      throw new AppError(
        'Không thể gửi lời mời kết bạn',
        'FRIEND_REQUEST_ERROR',
        error
      );
    }
  }

  /**
   * Delete a friendship (cancel request or unfriend)
   * @param friendshipId ID of the friendship to delete
   * @returns Promise<void>
   * @throws AppError if API call fails
   */
  async deleteFriendship(friendshipId: number): Promise<void> {
    try {
      console.log('🗑️ Deleting friendship ID:', friendshipId);

      await apiClient.delete<void>(`/friendships/${friendshipId}`);

      console.log('✅ Friendship deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete friendship:', {
        friendshipId,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      // Handle specific error cases
      if (error?.status === 401) {
        throw new AppError(
          'Vui lòng đăng nhập để thực hiện thao tác này',
          'AUTHENTICATION_REQUIRED',
          error
        );
      }

      if (error?.status === 403) {
        throw new AppError(
          'Bạn không có quyền xóa mối quan hệ này',
          'FORBIDDEN',
          error
        );
      }

      if (error?.status === 404) {
        throw new AppError(
          'Mối quan hệ bạn bè không tồn tại',
          'FRIENDSHIP_NOT_FOUND',
          error
        );
      }

      throw new AppError(
        'Không thể xóa mối quan hệ bạn bè',
        'FRIENDSHIP_DELETE_ERROR',
        error
      );
    }
  }

  /**
   * Get list of friends for the current user
   * @returns Promise<FriendUser[]> Array of friends
   * @throws AppError if API call fails
   */
  async getFriends(): Promise<FriendUser[]> {
    try {
      console.log('👥 Getting friends list');

      const response = await apiClient.get<FriendUser[]>('/friendships/friends');

      console.log('✅ Friends list retrieved successfully:', {
        count: response.length,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to get friends list:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      if (error?.status === 401) {
        throw new AppError(
          'Vui lòng đăng nhập để xem danh sách bạn bè',
          'AUTHENTICATION_REQUIRED',
          error
        );
      }

      throw new AppError(
        'Không thể tải danh sách bạn bè',
        'FRIENDS_LIST_ERROR',
        error
      );
    }
  }

  /**
   * Get list of pending friend requests for the current user
   * @returns Promise<FriendUser[]> Array of users who sent friend requests
   * @throws AppError if API call fails
   */
  async getFriendRequests(): Promise<FriendUser[]> {
    try {
      console.log('📬 Getting friend requests');

      const response = await apiClient.get<FriendUser[]>('/friendships/requests');

      console.log('✅ Friend requests retrieved successfully:', {
        count: response.length,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to get friend requests:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      if (error?.status === 401) {
        throw new AppError(
          'Vui lòng đăng nhập để xem lời mời kết bạn',
          'AUTHENTICATION_REQUIRED',
          error
        );
      }

      throw new AppError(
        'Không thể tải lời mời kết bạn',
        'FRIEND_REQUESTS_ERROR',
        error
      );
    }
  }

  /**
   * Accept a friend request
   * @param friendshipId ID of the friendship to accept
   * @returns Promise<SendFriendRequestResponse> Updated friendship data
   * @throws AppError if API call fails
   */
  async acceptFriendRequest(friendshipId: number): Promise<SendFriendRequestResponse> {
    try {
      console.log('✅ Accepting friend request:', friendshipId);

      const response = await apiClient.put<SendFriendRequestResponse>(
        `/friendships/${friendshipId}/accept`
      );

      console.log('✅ Friend request accepted successfully');

      return response;
    } catch (error: any) {
      console.error('❌ Failed to accept friend request:', {
        friendshipId,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      if (error?.status === 401) {
        throw new AppError(
          'Vui lòng đăng nhập để chấp nhận lời mời',
          'AUTHENTICATION_REQUIRED',
          error
        );
      }

      if (error?.status === 403) {
        throw new AppError(
          'Bạn không có quyền chấp nhận lời mời này',
          'FORBIDDEN',
          error
        );
      }

      if (error?.status === 404) {
        throw new AppError(
          'Lời mời kết bạn không tồn tại',
          'FRIENDSHIP_NOT_FOUND',
          error
        );
      }

      throw new AppError(
        'Không thể chấp nhận lời mời kết bạn',
        'ACCEPT_REQUEST_ERROR',
        error
      );
    }
  }

  /**
   * Reject a friend request
   * @param friendshipId ID of the friendship to reject
   * @returns Promise<void>
   * @throws AppError if API call fails
   */
  async rejectFriendRequest(friendshipId: number): Promise<void> {
    try {
      console.log('❌ Rejecting friend request:', friendshipId);

      await apiClient.put<void>(`/friendships/${friendshipId}/reject`);

      console.log('✅ Friend request rejected successfully');
    } catch (error: any) {
      console.error('❌ Failed to reject friend request:', {
        friendshipId,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      if (error?.status === 401) {
        throw new AppError(
          'Vui lòng đăng nhập để từ chối lời mời',
          'AUTHENTICATION_REQUIRED',
          error
        );
      }

      if (error?.status === 403) {
        throw new AppError(
          'Bạn không có quyền từ chối lời mời này',
          'FORBIDDEN',
          error
        );
      }

      if (error?.status === 404) {
        throw new AppError(
          'Lời mời kết bạn không tồn tại',
          'FRIENDSHIP_NOT_FOUND',
          error
        );
      }

      throw new AppError(
        'Không thể từ chối lời mời kết bạn',
        'REJECT_REQUEST_ERROR',
        error
      );
    }
  }
}

// Create and export singleton instance
export const friendshipService = new FriendshipServiceImpl();
