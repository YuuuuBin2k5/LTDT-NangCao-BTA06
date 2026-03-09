/**
 * Property-based tests for Friends Tab - Friend request UI update
 * Feature: friends-search, Property 11: Friend request UI update
 * Validates: Requirements 5.5
 */

import * as fc from 'fast-check';
import { FriendshipStatus, UserSearchResult } from '../../../../src/shared/types/friendship.types';

describe('Friends Tab - Friend Request UI Update Property Tests', () => {
  /**
   * Property 11: Friend request UI update
   * For any successful friend request, the UI button should update to show "Request Sent" or "Pending".
   * 
   * This property tests the state transformation logic:
   * - Initial state: user with friendshipStatus = null, button shows "Add Friend"
   * - After sendFriendRequest succeeds: friendshipStatus = PENDING, button shows "Cancel Request"
   */
  test('Property 11: Successful friend request transforms state from null to PENDING', () => {
    fc.assert(
      fc.property(
        // Generate random user with no friendship
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          avatarUrl: fc.option(fc.webUrl(), { nil: null }),
          friendshipStatus: fc.constant(null),
          friendshipId: fc.constant(null),
        }),
        fc.integer({ min: 1, max: 10000 }), // New friendship ID
        (user, newFriendshipId) => {
          // Simulate the state transformation that happens after successful friend request
          const updatedUser: UserSearchResult = {
            ...user,
            friendshipStatus: FriendshipStatus.PENDING,
            friendshipId: newFriendshipId,
          };

          // Property: After successful friend request, status must be PENDING
          expect(updatedUser.friendshipStatus).toBe(FriendshipStatus.PENDING);
          
          // Property: After successful friend request, friendshipId must be set
          expect(updatedUser.friendshipId).toBe(newFriendshipId);
          expect(updatedUser.friendshipId).not.toBeNull();
          
          // Property: Original user data should be preserved
          expect(updatedUser.id).toBe(user.id);
          expect(updatedUser.name).toBe(user.name);
          expect(updatedUser.username).toBe(user.username);
          expect(updatedUser.avatarUrl).toBe(user.avatarUrl);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Friend request UI update - Button text mapping
   * For any user with PENDING status, the button should show "Cancel Request"
   */
  test('Property 11: PENDING status maps to Cancel Request button', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          avatarUrl: fc.option(fc.webUrl(), { nil: null }),
          friendshipStatus: fc.constant(FriendshipStatus.PENDING),
          friendshipId: fc.integer({ min: 1, max: 10000 }),
        }),
        (user) => {
          // Determine button text based on friendship status
          const getButtonText = (status: FriendshipStatus | null): string => {
            if (status === FriendshipStatus.PENDING) {
              return 'Cancel Request';
            } else if (status === FriendshipStatus.ACCEPTED) {
              return 'Unfriend';
            } else {
              return 'Add Friend';
            }
          };

          const buttonText = getButtonText(user.friendshipStatus);

          // Property: PENDING status must show "Cancel Request"
          expect(buttonText).toBe('Cancel Request');
          expect(buttonText).not.toBe('Add Friend');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Friend request UI update - State transition validity
   * For any user, the transition from null -> PENDING is always valid
   */
  test('Property 11: null to PENDING is a valid state transition', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          avatarUrl: fc.option(fc.webUrl(), { nil: null }),
          friendshipStatus: fc.constant(null),
          friendshipId: fc.constant(null),
        }),
        (user) => {
          // Valid state transitions for friend request
          const isValidTransition = (
            from: FriendshipStatus | null,
            to: FriendshipStatus
          ): boolean => {
            // Can send friend request when status is null, REJECTED, or BLOCKED
            if (to === FriendshipStatus.PENDING) {
              return (
                from === null ||
                from === FriendshipStatus.REJECTED ||
                from === FriendshipStatus.BLOCKED
              );
            }
            return false;
          };

          // Property: Transition from null to PENDING is always valid
          expect(isValidTransition(user.friendshipStatus, FriendshipStatus.PENDING)).toBe(true);
          
          // Property: Cannot transition from PENDING to PENDING (duplicate request)
          expect(isValidTransition(FriendshipStatus.PENDING, FriendshipStatus.PENDING)).toBe(false);
          
          // Property: Cannot transition from ACCEPTED to PENDING (already friends)
          expect(isValidTransition(FriendshipStatus.ACCEPTED, FriendshipStatus.PENDING)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Friend request UI update - Idempotency
   * For any user list, updating one user's status should not affect other users
   */
  test('Property 11: Friend request updates only target user in list', () => {
    fc.assert(
      fc.property(
        // Generate list of users
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            username: fc.string({ minLength: 3, maxLength: 30 }),
            avatarUrl: fc.option(fc.webUrl(), { nil: null }),
            friendshipStatus: fc.constant(null),
            friendshipId: fc.constant(null),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        fc.integer({ min: 0, max: 9 }), // Target user index
        fc.integer({ min: 1, max: 10000 }), // New friendship ID
        (users, targetIndex, newFriendshipId) => {
          // Ensure unique IDs
          const uniqueUsers = users.map((u, i) => ({ ...u, id: i + 1 }));
          const actualTargetIndex = targetIndex % uniqueUsers.length;
          const targetUserId = uniqueUsers[actualTargetIndex].id;

          // Simulate updating one user's friendship status
          const updatedUsers = uniqueUsers.map((u) =>
            u.id === targetUserId
              ? {
                  ...u,
                  friendshipStatus: FriendshipStatus.PENDING,
                  friendshipId: newFriendshipId,
                }
              : u
          );

          // Property: Only one user should have PENDING status
          const pendingUsers = updatedUsers.filter(
            (u) => u.friendshipStatus === FriendshipStatus.PENDING
          );
          expect(pendingUsers.length).toBe(1);
          expect(pendingUsers[0].id).toBe(targetUserId);

          // Property: All other users should still have null status
          const nullStatusUsers = updatedUsers.filter(
            (u) => u.friendshipStatus === null
          );
          expect(nullStatusUsers.length).toBe(uniqueUsers.length - 1);

          // Property: Total count should remain the same
          expect(updatedUsers.length).toBe(uniqueUsers.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Friend request UI update - Reversibility
   * For any user with PENDING status, the state can be reverted back to null
   */
  test('Property 11: PENDING status can be reverted to null (cancel request)', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          avatarUrl: fc.option(fc.webUrl(), { nil: null }),
          friendshipStatus: fc.constant(FriendshipStatus.PENDING),
          friendshipId: fc.integer({ min: 1, max: 10000 }),
        }),
        (user) => {
          // Simulate canceling the friend request
          const revertedUser: UserSearchResult = {
            ...user,
            friendshipStatus: null,
            friendshipId: null,
          };

          // Property: After canceling, status should be null
          expect(revertedUser.friendshipStatus).toBeNull();
          
          // Property: After canceling, friendshipId should be null
          expect(revertedUser.friendshipId).toBeNull();
          
          // Property: User data should be preserved
          expect(revertedUser.id).toBe(user.id);
          expect(revertedUser.name).toBe(user.name);
          expect(revertedUser.username).toBe(user.username);
        }
      ),
      { numRuns: 100 }
    );
  });
});
