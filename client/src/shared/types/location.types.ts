import { AvatarFrame } from './avatar-frame.types';

/**
 * Location-related type definitions
 */

export interface Location {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationUpdate {
  location: Location;
  userId: string;
}

/**
 * Privacy mode for location sharing
 */
export enum PrivacyMode {
  ALL_FRIENDS = 'ALL_FRIENDS',
  CLOSE_FRIENDS = 'CLOSE_FRIENDS',
  GHOST_MODE = 'GHOST_MODE'
}

/**
 * Friend location data
 */
export interface FriendLocation {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  isOnline: boolean;
  lastSeenMinutes?: number;
  selectedFrame?: AvatarFrame;
  statusMessage?: string;
  statusEmoji?: string;
}

/**
 * Location history entry
 */
export interface LocationHistoryEntry {
  id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  address?: string;
}

/**
 * Location update request with privacy
 */
export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  privacyMode?: PrivacyMode;
  statusMessage?: string;
  statusEmoji?: string;
}
