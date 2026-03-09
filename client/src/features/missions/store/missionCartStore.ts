/**
 * Zustand store cho Mission Cart
 * Quản lý local state của giỏ hàng missions
 */
import { create } from 'zustand';
import { missionService } from '../services/mission.service';
import type { MissionCart } from '../types/mission.types';

interface MissionCartStore {
  cart: MissionCart | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (missionId: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  startJourney: () => Promise<void>;
  clearError: () => void;
}

export const useMissionCartStore = create<MissionCartStore>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await missionService.getCart();
      set({ cart });
    } catch (e: any) {
      set({ error: e.message ?? 'Không thể tải giỏ hàng' });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (missionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await missionService.addToCart(missionId);
      set({ cart });
    } catch (e: any) {
      set({ error: e.message ?? 'Không thể thêm vào hành trình' });
      throw e; // Re-throw để UI có thể handle
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (itemId: number) => {
    set({ isLoading: true, error: null });
    try {
      await missionService.removeFromCart(itemId);
      // Refetch cart sau khi xóa
      const cart = await missionService.getCart();
      set({ cart });
    } catch (e: any) {
      set({ error: e.message ?? 'Không thể xóa khỏi hành trình' });
    } finally {
      set({ isLoading: false });
    }
  },

  startJourney: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await missionService.startJourney();
      set({ cart });
    } catch (e: any) {
      set({ error: e.message ?? 'Không thể bắt đầu hành trình' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
