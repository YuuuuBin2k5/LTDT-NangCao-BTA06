/**
 * Mission API service — gọi tất cả endpoints /api/missions
 */
import { apiClient } from '../../../services/api/client';
import type {
  Mission,
  MissionCart,
  MissionCartItem,
  UserXp,
  MissionStatus,
  AddToCartRequest,
  CheckInRequest,
  MissionsPageResponse,
} from '../types/mission.types';

class MissionService {
  // Danh sách missions (lazy load + filter)
  async getMissions(params: {
    categoryId?: number;
    lat?: number;
    lng?: number;
    page?: number;
    size?: number;
  }): Promise<MissionsPageResponse> {
    return apiClient.get<MissionsPageResponse>('/missions', { params });
  }

  // Chi tiết mission
  async getMissionById(id: number): Promise<Mission> {
    return apiClient.get<Mission>(`/missions/${id}`);
  }

  // ─── CART ───────────────────────────────────────────────────
  async getCart(): Promise<MissionCart> {
    return apiClient.get<MissionCart>('/missions/cart');
  }

  async addToCart(missionId: number): Promise<MissionCart> {
    return apiClient.post<MissionCart>('/missions/cart/items', { missionId });
  }

  async removeFromCart(itemId: number): Promise<void> {
    await apiClient.delete(`/missions/cart/items/${itemId}`);
  }

  // ─── START JOURNEY (= Checkout) ─────────────────────────────
  async startJourney(): Promise<MissionCart> {
    return apiClient.post<MissionCart>('/missions/cart/start');
  }

  // ─── TRACKER ────────────────────────────────────────────────
  async getTracker(): Promise<MissionCart> {
    return apiClient.get<MissionCart>('/missions/tracker');
  }

  async getHistory(): Promise<MissionCartItem[]> {
    return apiClient.get<MissionCartItem[]>('/missions/tracker/history');
  }

  async updateItemStatus(itemId: number, status: MissionStatus): Promise<MissionCartItem> {
    return apiClient.patch<MissionCartItem>(
      `/missions/tracker/${itemId}/status`,
      { status }
    );
  }

  async checkIn(itemId: number, req: CheckInRequest): Promise<MissionCartItem> {
    return apiClient.post<MissionCartItem>(
      `/missions/tracker/${itemId}/checkin`,
      req
    );
  }

  async cancelItem(itemId: number): Promise<void> {
    await apiClient.delete(`/missions/tracker/${itemId}`);
  }

  // ─── XP ─────────────────────────────────────────────────────
  async getMyXp(): Promise<UserXp> {
    return apiClient.get<UserXp>('/missions/xp');
  }
}

export const missionService = new MissionService();
