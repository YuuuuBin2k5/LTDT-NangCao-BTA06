/**
 * Friendship-related type definitions
 */

/**
 * Friendship status enum
 */
export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

/**
 * Friend action enum for UI interactions
 */
export enum FriendAction {
  ADD_FRIEND = 'ADD_FRIEND',
  CANCEL_REQUEST = 'CANCEL_REQUEST',
  UNFRIEND = 'UNFRIEND',
  ACCEPT_REQUEST = 'ACCEPT_REQUEST',
  REJECT_REQUEST = 'REJECT_REQUEST',
}

/**
 * User search result interface
 * Contains user information and friendship status for search results
 */
export interface UserSearchResult {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  friendshipStatus: FriendshipStatus | null;
  friendshipId: number | null;
}

/**
 * Friend user interface
 * Simplified user data for friends list
 */
export interface FriendUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  friendshipId?: number | null;
  friendshipStatus?: FriendshipStatus | null;
}
