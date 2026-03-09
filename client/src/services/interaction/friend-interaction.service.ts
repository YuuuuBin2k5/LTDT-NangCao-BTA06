import { apiClient } from '../api/client';
import { AppError } from '../../shared/types/error.types';
import {
  Interaction,
  SendInteractionRequest,
  InteractionStats,
} from '../../shared/types/interaction.types';

/**
 * FriendInteractionService interface for friend interaction operations
 */
export interface FriendInteractionService {
  sendInteraction(request: SendInteractionRequest): Promise<Interaction>;
  getReceivedInteractions(page?: number, size?: number): Promise<Interaction[]>;
  getStatistics(): Promise<InteractionStats>;
}

/**
 * FriendInteractionService implementation
 */
class FriendInteractionServiceImpl implements FriendInteractionService {
  /**
   * Send an interaction to a friend
   * @param request Interaction request with toUserId and type
   * @returns Promise<Interaction> Created interaction
   * @throws AppError if API call fails or cooldown active
   */
  async sendInteraction(request: SendInteractionRequest): Promise<Interaction> {
    try {
      console.log('💫 Sending interaction:', request);

      const response = await apiClient.post<Interaction>(
        '/friend-interactions/send',
        request
      );

      // Transform timestamp to Date
      const interaction = {
        ...response,
        createdAt: new Date(response.createdAt),
      };

      console.log('✅ Interaction sent:', {
        id: interaction.id,
        type: interaction.interactionType,
        toUserId: interaction.toUserId,
      });

      return interaction;
    } catch (error: any) {
      console.error('❌ Failed to send interaction:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      // Handle specific error cases
      if (error?.status === 429) {
        throw new AppError(
          'Vui lòng đợi 10 giây trước khi gửi tương tác tiếp theo',
          'INTERACTION_COOLDOWN',
          error
        );
      }

      if (error?.status === 403) {
        throw new AppError(
          'Bạn không thể gửi tương tác cho người này',
          'INTERACTION_FORBIDDEN',
          error
        );
      }

      throw new AppError(
        'Không thể gửi tương tác',
        'INTERACTION_SEND_ERROR',
        error
      );
    }
  }

  /**
   * Get received interactions with pagination
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Promise<Interaction[]> Array of received interactions
   * @throws AppError if API call fails
   */
  async getReceivedInteractions(
    page: number = 0,
    size: number = 20
  ): Promise<Interaction[]> {
    try {
      console.log('📬 Fetching received interactions:', { page, size });

      const response = await apiClient.get<Interaction[]>(
        '/friend-interactions/received',
        { params: { page, size } }
      );

      // Transform timestamps to Date objects
      const interactions = response.map((interaction) => ({
        ...interaction,
        createdAt: new Date(interaction.createdAt),
      }));

      console.log('✅ Received interactions fetched:', {
        count: interactions.length,
        page,
      });

      return interactions;
    } catch (error: any) {
      console.error('❌ Failed to fetch received interactions:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      throw new AppError(
        'Không thể tải tương tác',
        'INTERACTIONS_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Get interaction statistics for the current user
   * @returns Promise<InteractionStats> Interaction statistics
   * @throws AppError if API call fails
   */
  async getStatistics(): Promise<InteractionStats> {
    try {
      console.log('📊 Fetching interaction statistics');

      const response = await apiClient.get<InteractionStats>(
        '/friend-interactions/statistics'
      );

      console.log('✅ Interaction statistics fetched:', {
        totalSent: response.totalSent,
        totalReceived: response.totalReceived,
        bestFriendsCount: response.bestFriends.length,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to fetch interaction statistics:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
      });

      throw new AppError(
        'Không thể tải thống kê tương tác',
        'INTERACTION_STATS_FETCH_ERROR',
        error
      );
    }
  }
}

// Create and export singleton instance
export const friendInteractionService = new FriendInteractionServiceImpl();
