/**
 * TanStack Query hook cho Mission Tracker — polling 30 giây
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { missionService } from '../services/mission.service';
import type { CheckInRequest, MissionStatus } from '../types/mission.types';
import { useMissionCartStore } from '../store/missionCartStore';

export const TRACKER_QUERY_KEY = 'mission-tracker';
export const HISTORY_QUERY_KEY = 'mission-history';

export function useMissionTracker() {
  const queryClient = useQueryClient();
  const lastUpdated = useMissionCartStore((state) => state.lastUpdated);

  // Auto-invalidate tracker when cart store updates
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [TRACKER_QUERY_KEY] });
  }, [lastUpdated, queryClient]);

  // Tracker với polling 30s
  const trackerQuery = useQuery({
    queryKey: [TRACKER_QUERY_KEY],
    queryFn: () => missionService.getTracker(),
    refetchInterval: 30_000, // polling mỗi 30 giây
    retry: false,
  });

  // Lịch sử
  const historyQuery = useQuery({
    queryKey: [HISTORY_QUERY_KEY],
    queryFn: () => missionService.getHistory(),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: MissionStatus }) =>
      missionService.updateItemStatus(itemId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TRACKER_QUERY_KEY] }),
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: ({ itemId, req }: { itemId: number; req: CheckInRequest }) =>
      missionService.checkIn(itemId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRACKER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['user-xp'] });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (itemId: number) => missionService.cancelItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TRACKER_QUERY_KEY] }),
  });

  return {
    tracker: trackerQuery.data,
    history: historyQuery.data ?? [],
    isLoadingTracker: trackerQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    updateStatus: updateStatusMutation.mutateAsync,
    checkIn: checkInMutation.mutateAsync,
    cancelItem: cancelMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

// Hook riêng cho XP
export function useUserXp() {
  return useQuery({
    queryKey: ['user-xp'],
    queryFn: () => missionService.getMyXp(),
  });
}
