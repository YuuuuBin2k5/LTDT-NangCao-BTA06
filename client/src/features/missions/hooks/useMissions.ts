/**
 * TanStack Query hook cho danh sách missions — hỗ trợ infinite scroll (lazy load)
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { missionService } from '../services/mission.service';
import type { Mission } from '../types/mission.types';

export const MISSIONS_QUERY_KEY = 'missions';

/** Normalize server response (plain array OR Page<Mission>) into a Page shape */
function normalizePage(raw: any): { content: Mission[]; last: boolean; number: number } {
  if (Array.isArray(raw)) {
    return { content: raw, last: true, number: 0 };
  }
  return {
    content: Array.isArray(raw?.content) ? raw.content : [],
    last: raw?.last ?? true,
    number: raw?.number ?? 0,
  };
}

export function useMissions(params: {
  categoryId?: number;
  lat?: number;
  lng?: number;
}) {
  return useInfiniteQuery({
    queryKey: [MISSIONS_QUERY_KEY, params.categoryId, params.lat, params.lng],
    queryFn: async ({ pageParam = 0 }) => {
      const raw = await missionService.getMissions({
        categoryId: params.categoryId,
        lat: params.lat,
        lng: params.lng,
        page: pageParam as number,
        size: 10,
      });
      return normalizePage(raw);
    },
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    initialPageParam: 0,
  });
}
