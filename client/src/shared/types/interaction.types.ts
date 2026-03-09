/**
 * Friend interaction type definitions
 */

/**
 * Interaction type enum
 */
export enum InteractionType {
  HEART = 'HEART',
  WAVE = 'WAVE',
  POKE = 'POKE',
  FIRE = 'FIRE',
  STAR = 'STAR',
  HUG = 'HUG',
}

/**
 * Interaction data
 */
export interface Interaction {
  id: number;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  interactionType: InteractionType;
  fromLocation?: { latitude: number; longitude: number };
  toLocation?: { latitude: number; longitude: number };
  isRead: boolean;
  createdAt: Date;
}

/**
 * Send interaction request
 */
export interface SendInteractionRequest {
  toUserId: string;
  interactionType: InteractionType;
}

/**
 * Interaction statistics
 */
export interface InteractionStats {
  totalSent: number;
  totalReceived: number;
  heartsSent: number;
  heartsReceived: number;
  wavesSent: number;
  wavesReceived: number;
  pokesSent: number;
  pokesReceived: number;
  firesSent: number;
  firesReceived: number;
  starsSent: number;
  starsReceived: number;
  hugsSent: number;
  hugsReceived: number;
  bestFriends: BestFriend[];
}

/**
 * Best friend data
 */
export interface BestFriend {
  friendId: string;
  name: string;
  username: string;
  avatarUrl: string;
  interactionCount: number;
}

/**
 * Active effect for animation
 */
export interface ActiveEffect {
  id: string;
  type: InteractionType;
  fromCoordinate: { latitude: number; longitude: number };
  toCoordinate: { latitude: number; longitude: number };
  progress: number;
  startTime: number;
}
