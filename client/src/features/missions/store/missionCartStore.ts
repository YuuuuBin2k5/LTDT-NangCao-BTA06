/**
 * Zustand store cho Mission Cart
 * Quản lý local state của giỏ hàng missions
 */
import { create } from 'zustand';
import { missionService } from '../services/mission.service';
import type { MissionCart } from '../types/mission.types';
import { QueryClient } from '@tanstack/react-query';
import { TRACKER_QUERY_KEY } from '../hooks/useMissionTracker';

// Shared QueryClient instance (should ideally match the app's provider, 
// using a global query client to invalidate or firing an event)
// Instead of requiring a query client, we will fire a clear event 
// that can trigger invalidation in components. It's safer.
export const triggerTrackerRefetch = () => {
  // A hacky but effective way outside of React context if we can't import the global queryClient
  // We'll update the store to just maintain state and let useMissionTracker handle its own invalidate via events
};

interface MissionCartStore {
  cart: MissionCart | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (missionId: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  startJourney: () => Promise<void>;
  clearError: () => void;
  notifyUpdate: () => void;
}

export const useMissionCartStore = create<MissionCartStore>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  lastUpdated: Date.now(),

  notifyUpdate: () => set({ lastUpdated: Date.now() }),

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
      set({ cart, lastUpdated: Date.now() });
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
      set({ cart, lastUpdated: Date.now() });
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
      set({ cart, lastUpdated: Date.now() });
    } catch (e: any) {
      set({ error: e.message ?? 'Không thể bắt đầu hành trình' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
