import { apiClient } from '../api/client';
import { AppError } from '../../shared/types/error.types';
import { AvatarFrame } from '../../shared/types/avatar-frame.types';

/**
 * AvatarFrameService interface for avatar frame operations
 */
export interface AvatarFrameService {
  getAllFrames(): Promise<AvatarFrame[]>;
  getUnlockedFrameIds(): Promise<string[]>;
  selectFrame(frameId: string): Promise<void>;
  unlockFrame(frameId: string): Promise<void>;
}

/**
 * AvatarFrameService implementation
 */
class AvatarFrameServiceImpl implements AvatarFrameService {
  /**
   * Get all avatar frames with unlock/selected status
   * @returns Promise<AvatarFrame[]> Array of all frames
   * @throws AppError if API call fails
   */
  async getAllFrames(): Promise<AvatarFrame[]> {
    try {
      console.log('🖼️ Fetching all avatar frames');

      const response = await apiClient.get<AvatarFrame[]>('/avatar-frames');

      // Transform date strings to Date objects
      const frames = response.map((frame) => ({
        ...frame,
        availableFrom: frame.availableFrom ? new Date(frame.availableFrom) : undefined,
        availableUntil: frame.availableUntil ? new Date(frame.availableUntil) : undefined,
      }));

      console.log('✅ Avatar frames fetched:', {
        total: frames.length,
        unlocked: frames.filter((f) => f.isUnlocked).length,
        selected: frames.find((f) => f.isSelected)?.name,
      });

      return frames;
    } catch (error: any) {
      console.error('❌ Failed to fetch avatar frames:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      throw new AppError(
        'Không thể tải khung ảnh',
        'AVATAR_FRAMES_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Get list of unlocked frame IDs for the current user
   * @returns Promise<string[]> Array of unlocked frame IDs
   * @throws AppError if API call fails
   */
  async getUnlockedFrameIds(): Promise<string[]> {
    try {
      console.log('🔓 Fetching unlocked frame IDs');

      const response = await apiClient.get<string[]>('/avatar-frames/unlocked');

      console.log('✅ Unlocked frame IDs fetched:', {
        count: response.length,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to fetch unlocked frame IDs:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      throw new AppError(
        'Không thể tải danh sách khung đã mở',
        'UNLOCKED_FRAMES_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Select an avatar frame
   * @param frameId ID of the frame to select
   * @throws AppError if API call fails or frame is locked
   */
  async selectFrame(frameId: string): Promise<void> {
    try {
      console.log('✨ Selecting avatar frame:', frameId);

      await apiClient.post(`/avatar-frames/${frameId}/select`);

      console.log('✅ Avatar frame selected:', frameId);
    } catch (error: any) {
      console.error('❌ Failed to select avatar frame:', {
        frameId,
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      // Handle specific error cases
      if (error?.status === 403) {
        throw new AppError(
          'Khung ảnh này chưa được mở khóa',
          'FRAME_LOCKED',
          error
        );
      }

      throw new AppError(
        'Không thể chọn khung ảnh',
        'FRAME_SELECT_ERROR',
        error
      );
    }
  }

  /**
   * Unlock an avatar frame
   * @param frameId ID of the frame to unlock
   * @throws AppError if API call fails or requirements not met
   */
  async unlockFrame(frameId: string): Promise<void> {
    try {
      console.log('🔓 Unlocking avatar frame:', frameId);

      await apiClient.post(`/avatar-frames/${frameId}/unlock`);

      console.log('✅ Avatar frame unlocked:', frameId);
    } catch (error: any) {
      console.error('❌ Failed to unlock avatar frame:', {
        frameId,
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      // Handle specific error cases
      if (error?.status === 403) {
        throw new AppError(
          'Chưa đủ điều kiện để mở khóa khung ảnh này',
          'UNLOCK_REQUIREMENTS_NOT_MET',
          error
        );
      }

      throw new AppError(
        'Không thể mở khóa khung ảnh',
        'FRAME_UNLOCK_ERROR',
        error
      );
    }
  }
}

// Create and export singleton instance
export const avatarFrameService = new AvatarFrameServiceImpl();
