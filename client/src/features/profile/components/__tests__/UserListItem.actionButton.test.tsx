/**
 * Property-based tests for UserListItem component - Action button mapping
 * Feature: friends-search, Property 9: Action button mapping
 * Validates: Requirements 4.4, 4.5, 6.1, 6.2
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import * as fc from 'fast-check';
import { UserListItem } from '../UserListItem';
import { UserSearchResult, FriendshipStatus, FriendAction } from '../../../../shared/types';

describe('UserListItem - Action Button Mapping Property Tests', () => {
  /**
   * Property 9: Action button mapping
   * For any search result displayed in UI, the action button should match the friendship status:
   * - "Add Friend" for null/NONE
   * - "Cancel Request" for PENDING (if requester)
   * - "Unfriend" for ACCEPTED
   */
  test('Property 9: Action button mapping - button text matches friendship status', () => {
    fc.assert(
      fc.property(
        // Generate random user data
        fc.integer({ min: 1, max: 10000 }), // userId
        fc.string({ minLength: 1, maxLength: 50 }), // name
        fc.string({ minLength: 3, maxLength: 30 }), // username
        fc.option(fc.webUrl(), { nil: null }), // avatarUrl (can be null)
        fc.oneof(
          fc.constant(null),
          fc.constantFrom(
            FriendshipStatus.PENDING,
            FriendshipStatus.ACCEPTED,
            FriendshipStatus.REJECTED,
            FriendshipStatus.BLOCKED
          )
        ), // friendshipStatus
        fc.option(fc.integer({ min: 1, max: 10000 }), { nil: null }), // friendshipId
        (userId, name, username, avatarUrl, friendshipStatus, friendshipId) => {
          const user: UserSearchResult = {
            id: userId,
            name,
            username,
            avatarUrl,
            friendshipStatus,
            friendshipId,
          };

          const mockOnFriendAction = jest.fn();

          const { getByText } = render(
            <UserListItem user={user} onFriendAction={mockOnFriendAction} />
          );

          // Verify button text matches friendship status
          if (friendshipStatus === FriendshipStatus.PENDING) {
            expect(getByText('Cancel Request')).toBeTruthy();
          } else if (friendshipStatus === FriendshipStatus.ACCEPTED) {
            expect(getByText('Unfriend')).toBeTruthy();
          } else {
            // null, REJECTED, or BLOCKED should show "Add Friend"
            expect(getByText('Add Friend')).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: Action button mapping - button action matches friendship status', () => {
    fc.assert(
      fc.property(
        // Generate random user data
        fc.integer({ min: 1, max: 10000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 30 }),
        fc.option(fc.webUrl(), { nil: null }),
        fc.oneof(
          fc.constant(null),
          fc.constantFrom(
            FriendshipStatus.PENDING,
            FriendshipStatus.ACCEPTED,
            FriendshipStatus.REJECTED,
            FriendshipStatus.BLOCKED
          )
        ),
        fc.option(fc.integer({ min: 1, max: 10000 }), { nil: null }),
        (userId, name, username, avatarUrl, friendshipStatus, friendshipId) => {
          const user: UserSearchResult = {
            id: userId,
            name,
            username,
            avatarUrl,
            friendshipStatus,
            friendshipId,
          };

          const mockOnFriendAction = jest.fn();

          const { getByText } = render(
            <UserListItem user={user} onFriendAction={mockOnFriendAction} />
          );

          // Find and press the button
          let buttonText: string;
          let expectedAction: FriendAction;

          if (friendshipStatus === FriendshipStatus.PENDING) {
            buttonText = 'Cancel Request';
            expectedAction = FriendAction.CANCEL_REQUEST;
          } else if (friendshipStatus === FriendshipStatus.ACCEPTED) {
            buttonText = 'Unfriend';
            expectedAction = FriendAction.UNFRIEND;
          } else {
            buttonText = 'Add Friend';
            expectedAction = FriendAction.ADD_FRIEND;
          }

          const button = getByText(buttonText);
          fireEvent.press(button);

          // Verify the callback was called with correct parameters
          expect(mockOnFriendAction).toHaveBeenCalledTimes(1);
          expect(mockOnFriendAction).toHaveBeenCalledWith(userId, expectedAction, friendshipId);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: Action button mapping - null status shows Add Friend', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 30 }),
        fc.option(fc.webUrl(), { nil: null }),
        (userId, name, username, avatarUrl) => {
          const user: UserSearchResult = {
            id: userId,
            name,
            username,
            avatarUrl,
            friendshipStatus: null,
            friendshipId: null,
          };

          const mockOnFriendAction = jest.fn();

          const { getByText } = render(
            <UserListItem user={user} onFriendAction={mockOnFriendAction} />
          );

          // Verify "Add Friend" button is shown
          expect(getByText('Add Friend')).toBeTruthy();

          // Press the button
          const button = getByText('Add Friend');
          fireEvent.press(button);

          // Verify ADD_FRIEND action is triggered
          expect(mockOnFriendAction).toHaveBeenCalledWith(userId, FriendAction.ADD_FRIEND, null);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: Action button mapping - REJECTED status shows Add Friend', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 30 }),
        fc.option(fc.webUrl(), { nil: null }),
        fc.option(fc.integer({ min: 1, max: 10000 }), { nil: null }),
        (userId, name, username, avatarUrl, friendshipId) => {
          const user: UserSearchResult = {
            id: userId,
            name,
            username,
            avatarUrl,
            friendshipStatus: FriendshipStatus.REJECTED,
            friendshipId,
          };

          const mockOnFriendAction = jest.fn();

          const { getByText } = render(
            <UserListItem user={user} onFriendAction={mockOnFriendAction} />
          );

          // Verify "Add Friend" button is shown for REJECTED status
          expect(getByText('Add Friend')).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: Action button mapping - BLOCKED status shows Add Friend', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 30 }),
        fc.option(fc.webUrl(), { nil: null }),
        fc.option(fc.integer({ min: 1, max: 10000 }), { nil: null }),
        (userId, name, username, avatarUrl, friendshipId) => {
          const user: UserSearchResult = {
            id: userId,
            name,
            username,
            avatarUrl,
            friendshipStatus: FriendshipStatus.BLOCKED,
            friendshipId,
          };

          const mockOnFriendAction = jest.fn();

          const { getByText } = render(
            <UserListItem user={user} onFriendAction={mockOnFriendAction} />
          );

          // Verify "Add Friend" button is shown for BLOCKED status
          expect(getByText('Add Friend')).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: Action button mapping - loading state disables button', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 30 }),
        fc.option(fc.webUrl(), { nil: null }),
        fc.oneof(
          fc.constant(null),
          fc.constantFrom(
            FriendshipStatus.PENDING,
            FriendshipStatus.ACCEPTED,
            FriendshipStatus.REJECTED,
            FriendshipStatus.BLOCKED
          )
        ),
        fc.option(fc.integer({ min: 1, max: 10000 }), { nil: null }),
        (userId, name, username, avatarUrl, friendshipStatus, friendshipId) => {
          const user: UserSearchResult = {
            id: userId,
            name,
            username,
            avatarUrl,
            friendshipStatus,
            friendshipId,
          };

          const mockOnFriendAction = jest.fn();

          const { queryByText, UNSAFE_getByType } = render(
            <UserListItem user={user} onFriendAction={mockOnFriendAction} isLoading={true} />
          );

          // When loading, button should not be visible, ActivityIndicator should be shown
          const activityIndicator = UNSAFE_getByType(ActivityIndicator);
          expect(activityIndicator).toBeTruthy();

          // Button text should not be visible
          expect(queryByText('Add Friend')).toBeNull();
          expect(queryByText('Cancel Request')).toBeNull();
          expect(queryByText('Unfriend')).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
