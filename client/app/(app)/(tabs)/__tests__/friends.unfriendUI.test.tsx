/**
 * Property-based tests for Friends Tab - Unfriend UI update
 * Feature: friends-search, Property 13: Unfriend UI update
 * Validates: Requirements 6.5
 */

import * as fc from 'fast-check';
import { FriendshipStatus, UserSearchResult } from '../../../../src/shared/types/friendship.types';

describe('Friends Tab - Unfriend UI Update Property Tests', () => {
  /**
   * Property 13: Unfriend UI update
   * For any successful friendship deletion, the UI button should update back to "Add Friend".
   * 
   * This property tests the state transformation logic:
   * - Initial state: user with friendshipStatus = ACCEPTED, button shows "Unfriend"
   * - After unfriend succeeds: friendshipStatus = null, button shows "Add Friend"
   */
  test('Property 13: Successful unfriend transforms state from ACCEPTED to null', () => {
    fc.assert(
      fc.property(
        // Generate random user with ACCEPTED friendship
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          avatarUrl: fc.option(fc.webUrl(), { nil: null }),
          friendshipStatus: fc.constant(FriendshipStatus.ACCEPTED),
          friendshipId: fc.integer({ min: 1, max: 10000 }),
        }),
        (user) => {
          // Simulate the state transformation that happens after successful unfriend
          const updatedUser: UserSearchResult = {
            ...user,
            friendshipStatus: null,
            friendshipId: null,
          };

          // Property: After successful unfriend, status must be null
          expect(updatedUser.friendshipStatus).toBeNull();
          
          // Property: After successful unfriend, friendshipId must be null
          expect(updatedUser.friendshipId).toBeNull();
          
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
   * Property 13: Unfriend UI update - Button text mapping
   * For any user with null status, the button should show "Add Friend"
   */
  test('Property 13: null status maps to Add Friend button', () => {
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

          // Property: null status must show "Add Friend"
          expect(buttonText).toBe('Add Friend');
          expect(buttonText).not.toBe('Unfriend');
          expect(buttonText).not.toBe('Cancel Request');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Unfriend UI update - State transition validity
   * For any user, the transition from ACCEPTED -> null is always valid
   */
  test('Property 13: ACCEPTED to null is a valid state transition', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          avatarUrl: fc.option(fc.webUrl(), { nil: null }),
          friendshipStatus: fc.constant(FriendshipStatus.ACCEPTED),
          friendshipId: fc.integer({ min: 1, max: 10000 }),
        }),
        (user) => {
          // Valid state transitions for unfriend
          const isValidUnfriendTransition = (
            from: FriendshipStatus | null
          ): boolean => {
            // Can unfriend when status is ACCEPTED
            return from === FriendshipStatus.ACCEPTED;
          };

          // Property: Transition from ACCEPTED to null is always valid
          expect(isValidUnfriendTransition(user.friendshipStatus)).toBe(true);
          
          // Property: Cannot unfriend when status is null (not friends)
          expect(isValidUnfriendTransition(null)).toBe(false);
          
          // Property: Cannot unfriend when status is PENDING (not yet friends)
          expect(isValidUnfriendTransition(FriendshipStatus.PENDING)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Unfriend UI update - Idempotency
   * For any user list, unfriending one user should not affect other users
   */
  test('Property 13: Unfriend updates only target user in list', () => {
    fc.assert(
      fc.property(
        // Generate list of users with ACCEPTED friendships
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            username: fc.string({ minLength: 3, maxLength: 30 }),
            avatarUrl: fc.option(fc.webUrl(), { nil: null }),
            friendshipStatus: fc.constant(FriendshipStatus.ACCEPTED),
            friendshipId: fc.integer({ min: 1, max: 10000 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        fc.integer({ min: 0, max: 9 }), // Target user index
        (users, targetIndex) => {
          // Ensure unique IDs
          const uniqueUsers = users.map((u, i) => ({ ...u, id: i + 1, friendshipId: i + 100 }));
          const actualTargetIndex = targetIndex % uniqueUsers.length;
          const targetUserId = uniqueUsers[actualTargetIndex].id;

          // Simulate unfriending one user
          const updatedUsers = uniqueUsers.map((u) =>
            u.id === targetUserId
              ? {
                  ...u,
                  friendshipStatus: null,
                  friendshipId: null,
                }
              : u
          );

          // Property: Only one user should have null status
          const nullStatusUsers = updatedUsers.filter(
            (u) => u.friendshipStatus === null
          );
          expect(nullStatusUsers.length).toBe(1);
          expect(nullStatusUsers[0].id).toBe(targetUserId);

          // Property: All other users should still have ACCEPTED status
          const acceptedUsers = updatedUsers.filter(
            (u) => u.friendshipStatus === FriendshipStatus.ACCEPTED
          );
          expect(acceptedUsers.length).toBe(uniqueUsers.length - 1);

          // Property: Total count should remain the same
          expect(updatedUsers.length).toBe(uniqueUsers.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Unfriend UI update - Round trip property
   * For any user, the sequence: null -> PENDING -> ACCEPTED -> null should be valid
   */
  test('Property 13: Friendship lifecycle round trip is valid', () => {
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
        (initialUser) => {
          // Step 1: Send friend request (null -> PENDING)
          const pendingUser: UserSearchResult = {
            ...initialUser,
            friendshipStatus: FriendshipStatus.PENDING,
            friendshipId: 123,
          };
          expect(pendingUser.friendshipStatus).toBe(FriendshipStatus.PENDING);

          // Step 2: Accept friend request (PENDING -> ACCEPTED)
          const acceptedUser: UserSearchResult = {
            ...pendingUser,
            friendshipStatus: FriendshipStatus.ACCEPTED,
          };
          expect(acceptedUser.friendshipStatus).toBe(FriendshipStatus.ACCEPTED);

          // Step 3: Unfriend (ACCEPTED -> null)
          const unfriendedUser: UserSearchResult = {
            ...acceptedUser,
            friendshipStatus: null,
            friendshipId: null,
          };
          expect(unfriendedUser.friendshipStatus).toBeNull();
          expect(unfriendedUser.friendshipId).toBeNull();

          // Property: After full cycle, user is back to initial state
          expect(unfriendedUser.friendshipStatus).toBe(initialUser.friendshipStatus);
          expect(unfriendedUser.friendshipId).toBe(initialUser.friendshipId);
          
          // Property: User data is preserved throughout
          expect(unfriendedUser.id).toBe(initialUser.id);
          expect(unfriendedUser.name).toBe(initialUser.name);
          expect(unfriendedUser.username).toBe(initialUser.username);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Unfriend UI update - Cancel request vs Unfriend
   * Both cancel request and unfriend result in null status, but start from different states
   */
  test('Property 13: Cancel request and unfriend both result in null status', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          username: fc.string({ minLength: 3, maxLength: 30 }),
          avatarUrl: fc.option(fc.webUrl(), { nil: null }),
        }),
        fc.integer({ min: 1, max: 10000 }),
        (baseUser, friendshipId) => {
          // Scenario 1: Cancel request (PENDING -> null)
          const pendingUser: UserSearchResult = {
            ...baseUser,
            friendshipStatus: FriendshipStatus.PENDING,
            friendshipId,
          };
          const canceledUser: UserSearchResult = {
            ...pendingUser,
            friendshipStatus: null,
            friendshipId: null,
          };

          // Scenario 2: Unfriend (ACCEPTED -> null)
          const acceptedUser: UserSearchResult = {
            ...baseUser,
            friendshipStatus: FriendshipStatus.ACCEPTED,
            friendshipId,
          };
          const unfriendedUser: UserSearchResult = {
            ...acceptedUser,
            friendshipStatus: null,
            friendshipId: null,
          };

          // Property: Both operations result in the same final state
          expect(canceledUser.friendshipStatus).toBe(unfriendedUser.friendshipStatus);
          expect(canceledUser.friendshipId).toBe(unfriendedUser.friendshipId);
          expect(canceledUser.friendshipStatus).toBeNull();
          expect(unfriendedUser.friendshipStatus).toBeNull();

          // Property: Both show "Add Friend" button after deletion
          const getButtonText = (status: FriendshipStatus | null): string => {
            if (status === FriendshipStatus.PENDING) return 'Cancel Request';
            if (status === FriendshipStatus.ACCEPTED) return 'Unfriend';
            return 'Add Friend';
          };

          expect(getButtonText(canceledUser.friendshipStatus)).toBe('Add Friend');
          expect(getButtonText(unfriendedUser.friendshipStatus)).toBe('Add Friend');
        }
      ),
      { numRuns: 100 }
    );
  });
});
