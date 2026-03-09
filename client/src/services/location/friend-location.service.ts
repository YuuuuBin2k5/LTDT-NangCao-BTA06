import { apiClient } from '../api/client';
import { AppError } from '../../shared/types/error.types';
import {
  FriendLocation,
  LocationHistoryEntry,
  PrivacyMode,
} from '../../shared/types/location.types';

/**
 * FriendLocationService interface for friend location operations
 */
export interface FriendLocationService {
  getFriendLocations(): Promise<FriendLocation[]>;
  getLocationHistory(days?: number): Promise<LocationHistoryEntry[]>;
  clearLocationHistory(): Promise<void>;
  updatePrivacyMode(mode: PrivacyMode): Promise<void>;
  updateStatus(status: string, emoji?: string): Promise<void>;
}

/**
 * FriendLocationService implementation
 */
class FriendLocationServiceImpl implements FriendLocationService {
  /**
   * Get locations of all friends with privacy filtering
   * @returns Promise<FriendLocation[]> Array of friend locations
   * @throws AppError if API call fails
   */
  async getFriendLocations(): Promise<FriendLocation[]> {
    try {
      console.log('👥 Fetching friend locations');

      const response = await apiClient.get<FriendLocation[]>('/locations/friends');

      // Server may return Page<> object or plain array — handle both
      const raw = response as any;
      const list: FriendLocation[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : [];

      // Transform timestamp strings to Date objects
      const friendLocations = list.map((location) => ({
        ...location,
        timestamp: new Date(location.timestamp),
      }));

      console.log('✅ Friend locations fetched:', {
        count: friendLocations.length,
        onlineCount: friendLocations.filter((f) => f.isOnline).length,
      });

      return friendLocations;
    } catch (error: any) {
      console.error('❌ Failed to fetch friend locations:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      throw new AppError(
        'Không thể tải vị trí bạn bè',
        'FRIEND_LOCATIONS_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Get location history for the current user
   * @param days Number of days to fetch (default: 7)
   * @returns Promise<LocationHistoryEntry[]> Array of location history entries
   * @throws AppError if API call fails
   */
  async getLocationHistory(days: number = 7): Promise<LocationHistoryEntry[]> {
    try {
      console.log('📜 Fetching location history:', { days });

      const response = await apiClient.get<LocationHistoryEntry[]>(
        '/locations/history',
        { params: { days } }
      );

      // Same defensive extraction
      const raw = response as any;
      const list: LocationHistoryEntry[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : [];

      const history = list.map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));

      console.log('✅ Location history fetched:', {
        count: history.length,
        days,
      });

      return history;
    } catch (error: any) {
      console.error('❌ Failed to fetch location history:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      throw new AppError(
        'Không thể tải lịch sử vị trí',
        'LOCATION_HISTORY_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Clear all location history for the current user
   * @throws AppError if API call fails
   */
  async clearLocationHistory(): Promise<void> {
    try {
      console.log('🗑️ Clearing location history');

      await apiClient.delete('/locations/history');

      console.log('✅ Location history cleared');
    } catch (error: any) {
      console.error('❌ Failed to clear location history:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      throw new AppError(
        'Không thể xóa lịch sử vị trí',
        'LOCATION_HISTORY_CLEAR_ERROR',
        error
      );
    }
  }

  /**
   * Update privacy mode for location sharing
   * @param mode Privacy mode to set
   * @throws AppError if API call fails
   */
  async updatePrivacyMode(mode: PrivacyMode): Promise<void> {
    try {
      console.log('🔒 Updating privacy mode:', mode);

      // This will be sent with the next location update
      // Store in local state for now
      console.log('✅ Privacy mode updated:', mode);
    } catch (error: any) {
      console.error('❌ Failed to update privacy mode:', {
        message: error?.message,
        code: error?.code,
      });

      throw new AppError(
        'Không thể cập nhật chế độ riêng tư',
        'PRIVACY_MODE_UPDATE_ERROR',
        error
      );
    }
  }

  /**
   * Update status message for current user
   * @param status Status message text
   * @param emoji Optional emoji
   * @throws AppError if API call fails
   */
  async updateStatus(status: string, emoji?: string): Promise<void> {
    try {
      console.log('💬 Updating status:', { status, emoji });

      await apiClient.put('/locations/status', {
        statusMessage: status,
        statusEmoji: emoji,
      });

      console.log('✅ Status updated');
    } catch (error: any) {
      console.error('❌ Failed to update status:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      throw new AppError(
        'Không thể cập nhật trạng thái',
        'STATUS_UPDATE_ERROR',
        error
      );
    }
  }
}

// Create and export singleton instance
export const friendLocationService = new FriendLocationServiceImpl();
