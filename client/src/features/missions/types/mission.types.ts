/**
 * TypeScript types cho Explore Missions
 */

export type MissionStatus =
  | 'AVAILABLE'
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'AT_LOCATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CANCEL_REQUESTED';

export type MissionCartStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export interface MissionCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  categoryId: number;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  xpReward: number;
  badgeName: string | null;
  difficulty: 1 | 2 | 3;
  deadline: string | null;
  placeName: string | null;
  placeAddress: string | null;
}

export interface MissionCartItem {
  id: number;
  mission: Mission;
  status: MissionStatus;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  checkInPhotoUrl: string | null;
}

export interface MissionCart {
  id: number;
  status: MissionCartStatus;
  startedAt: string | null;
  createdAt: string;
  items: MissionCartItem[];
  totalXpPossible: number;
}

export interface UserXp {
  totalXp: number;
  level: number;
  missionsCompleted: number;
  xpToNextLevel: number;
}

export interface MissionsPageResponse {
  content: Mission[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
}

export interface AddToCartRequest {
  missionId: number;
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

// Status label map (UI display)
export const STATUS_LABELS: Record<MissionStatus, string> = {
  AVAILABLE:        '🆕 Chưa bắt đầu',
  ACTIVE:           '✅ Đã xác nhận',
  IN_PROGRESS:      '🚶 Đang đi',
  AT_LOCATION:      '📍 Đang check-in',
  COMPLETED:        '🎉 Hoàn thành',
  CANCELLED:        '❌ Đã hủy',
  CANCEL_REQUESTED: '⏳ Yêu cầu hủy',
};

export const STATUS_COLORS: Record<MissionStatus, string> = {
  AVAILABLE:        '#95a5a6',
  ACTIVE:           '#3498db',
  IN_PROGRESS:      '#f39c12',
  AT_LOCATION:      '#9b59b6',
  COMPLETED:        '#2ecc71',
  CANCELLED:        '#e74c3c',
  CANCEL_REQUESTED: '#e67e22',
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: '⭐ Dễ',
  2: '⭐⭐ Trung bình',
  3: '⭐⭐⭐ Khó',
};
