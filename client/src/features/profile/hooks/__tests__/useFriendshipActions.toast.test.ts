/**
 * Property-based tests for useFriendshipActions hook - Toast notifications
 * Feature: friends-search, Property 17: Toast notification on action
 * Validates: Requirements 10.5
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as fc from 'fast-check';
import { useFriendshipActions } from '../useFriendshipActions';
import { friendshipService } from '../../../../services/friendship/friendship.service';
import { AppError } from '../../../../shared/types/error.types';

// Mock the friendship service
jest.mock('../../../../services/friendship/friendship.service', () => ({
  friendshipService: {
    sendFriendRequest: jest.fn(),
    deleteFriendship: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('useFriendshipActions - Toast Notification Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 17: Toast notification on action
   * For any friend request or unfriend action completion (success or failure),
   * a toast notification should be displayed.
   */
  test('Property 17: sendFriendRequest success should display toast notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random user IDs (positive integers)
        fc.integer({ min: 1, max: 10000 }),
        async (userId) => {
          jest.clearAllMocks();

          // Mock successful friend request
          (friendshipService.sendFriendRequest as jest.Mock).mockResolvedValue({
            id: Math.floor(Math.random() * 10000),
            userId1: 1,
            userId2: userId,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          });

          const { result } = renderHook(() => useFriendshipActions());

          // Execute sendFriendRequest
          await act(async () => {
            await result.current.sendFriendRequest(userId);
          });

          // Wait for state updates
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Verify Alert.alert was called (toast notification)
          expect(Alert.alert).toHaveBeenCalled();

          // Verify it was called with success message
          const alertCalls = (Alert.alert as jest.Mock).mock.calls;
          const lastCall = alertCalls[alertCalls.length - 1];
          
          // Should have title and message
          expect(lastCall).toHaveLength(2);
          expect(lastCall[0]).toBeTruthy(); // Title exists
          expect(lastCall[1]).toBeTruthy(); // Message exists
          
          // Success message should contain success indicator
          const title = lastCall[0].toLowerCase();
          const message = lastCall[1].toLowerCase();
          expect(
            title.includes('thành công') || 
            title.includes('success') ||
            message.includes('thành công') ||
            message.includes('success')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: sendFriendRequest failure should display error toast notification
   */
  test('Property 17: sendFriendRequest failure should display error toast notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random user IDs and error messages
        fc.tuple(
          fc.integer({ min: 1, max: 10000 }),
          fc.constantFrom(
            'INVALID_FRIEND_REQUEST',
            'AUTHENTICATION_REQUIRED',
            'USER_NOT_FOUND',
            'DUPLICATE_FRIEND_REQUEST',
            'FRIEND_REQUEST_ERROR'
          )
        ),
        async ([userId, errorCode]) => {
          jest.clearAllMocks();

          // Mock failed friend request
          const errorMessage = 'Test error message';
          (friendshipService.sendFriendRequest as jest.Mock).mockRejectedValue(
            new AppError(errorMessage, errorCode)
          );

          const { result } = renderHook(() => useFriendshipActions());

          // Execute sendFriendRequest and expect it to throw
          await act(async () => {
            try {
              await result.current.sendFriendRequest(userId);
            } catch (error) {
              // Expected to throw
            }
          });

          // Wait for state updates
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Verify Alert.alert was called (error toast notification)
          expect(Alert.alert).toHaveBeenCalled();

          // Verify it was called with error message
          const alertCalls = (Alert.alert as jest.Mock).mock.calls;
          const lastCall = alertCalls[alertCalls.length - 1];
          
          // Should have title and message
          expect(lastCall).toHaveLength(2);
          expect(lastCall[0]).toBeTruthy(); // Title exists
          expect(lastCall[1]).toBeTruthy(); // Message exists
          
          // Error message should contain error indicator
          const title = lastCall[0].toLowerCase();
          const message = lastCall[1].toLowerCase();
          expect(
            title.includes('lỗi') || 
            title.includes('error') ||
            message.includes('lỗi') ||
            message.includes('error')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: cancelRequest success should display toast notification
   */
  test('Property 17: cancelRequest success should display toast notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random friendship IDs (positive integers)
        fc.integer({ min: 1, max: 10000 }),
        async (friendshipId) => {
          jest.clearAllMocks();

          // Mock successful friendship deletion
          (friendshipService.deleteFriendship as jest.Mock).mockResolvedValue(undefined);

          const { result } = renderHook(() => useFriendshipActions());

          // Execute cancelRequest
          await act(async () => {
            await result.current.cancelRequest(friendshipId);
          });

          // Wait for state updates
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Verify Alert.alert was called (toast notification)
          expect(Alert.alert).toHaveBeenCalled();

          // Verify it was called with success message
          const alertCalls = (Alert.alert as jest.Mock).mock.calls;
          const lastCall = alertCalls[alertCalls.length - 1];
          
          // Should have title and message
          expect(lastCall).toHaveLength(2);
          expect(lastCall[0]).toBeTruthy(); // Title exists
          expect(lastCall[1]).toBeTruthy(); // Message exists
          
          // Success message should contain success indicator
          const title = lastCall[0].toLowerCase();
          const message = lastCall[1].toLowerCase();
          expect(
            title.includes('thành công') || 
            title.includes('success') ||
            message.includes('thành công') ||
            message.includes('success')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: cancelRequest failure should display error toast notification
   */
  test('Property 17: cancelRequest failure should display error toast notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random friendship IDs and error codes
        fc.tuple(
          fc.integer({ min: 1, max: 10000 }),
          fc.constantFrom(
            'AUTHENTICATION_REQUIRED',
            'FORBIDDEN',
            'FRIENDSHIP_NOT_FOUND',
            'FRIENDSHIP_DELETE_ERROR'
          )
        ),
        async ([friendshipId, errorCode]) => {
          jest.clearAllMocks();

          // Mock failed friendship deletion
          const errorMessage = 'Test error message';
          (friendshipService.deleteFriendship as jest.Mock).mockRejectedValue(
            new AppError(errorMessage, errorCode)
          );

          const { result } = renderHook(() => useFriendshipActions());

          // Execute cancelRequest and expect it to throw
          await act(async () => {
            try {
              await result.current.cancelRequest(friendshipId);
            } catch (error) {
              // Expected to throw
            }
          });

          // Wait for state updates
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Verify Alert.alert was called (error toast notification)
          expect(Alert.alert).toHaveBeenCalled();

          // Verify it was called with error message
          const alertCalls = (Alert.alert as jest.Mock).mock.calls;
          const lastCall = alertCalls[alertCalls.length - 1];
          
          // Should have title and message
          expect(lastCall).toHaveLength(2);
          expect(lastCall[0]).toBeTruthy(); // Title exists
          expect(lastCall[1]).toBeTruthy(); // Message exists
          
          // Error message should contain error indicator
          const title = lastCall[0].toLowerCase();
          const message = lastCall[1].toLowerCase();
          expect(
            title.includes('lỗi') || 
            title.includes('error') ||
            message.includes('lỗi') ||
            message.includes('error')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: unfriend success should display toast notification
   */
  test('Property 17: unfriend success should display toast notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random friendship IDs (positive integers)
        fc.integer({ min: 1, max: 10000 }),
        async (friendshipId) => {
          jest.clearAllMocks();

          // Mock successful friendship deletion
          (friendshipService.deleteFriendship as jest.Mock).mockResolvedValue(undefined);

          const { result } = renderHook(() => useFriendshipActions());

          // Execute unfriend
          await act(async () => {
            await result.current.unfriend(friendshipId);
          });

          // Wait for state updates
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Verify Alert.alert was called (toast notification)
          expect(Alert.alert).toHaveBeenCalled();

          // Verify it was called with success message
          const alertCalls = (Alert.alert as jest.Mock).mock.calls;
          const lastCall = alertCalls[alertCalls.length - 1];
          
          // Should have title and message
          expect(lastCall).toHaveLength(2);
          expect(lastCall[0]).toBeTruthy(); // Title exists
          expect(lastCall[1]).toBeTruthy(); // Message exists
          
          // Success message should contain success indicator
          const title = lastCall[0].toLowerCase();
          const message = lastCall[1].toLowerCase();
          expect(
            title.includes('thành công') || 
            title.includes('success') ||
            message.includes('thành công') ||
            message.includes('success')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: unfriend failure should display error toast notification
   */
  test('Property 17: unfriend failure should display error toast notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random friendship IDs and error codes
        fc.tuple(
          fc.integer({ min: 1, max: 10000 }),
          fc.constantFrom(
            'AUTHENTICATION_REQUIRED',
            'FORBIDDEN',
            'FRIENDSHIP_NOT_FOUND',
            'FRIENDSHIP_DELETE_ERROR'
          )
        ),
        async ([friendshipId, errorCode]) => {
          jest.clearAllMocks();

          // Mock failed friendship deletion
          const errorMessage = 'Test error message';
          (friendshipService.deleteFriendship as jest.Mock).mockRejectedValue(
            new AppError(errorMessage, errorCode)
          );

          const { result } = renderHook(() => useFriendshipActions());

          // Execute unfriend and expect it to throw
          await act(async () => {
            try {
              await result.current.unfriend(friendshipId);
            } catch (error) {
              // Expected to throw
            }
          });

          // Wait for state updates
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Verify Alert.alert was called (error toast notification)
          expect(Alert.alert).toHaveBeenCalled();

          // Verify it was called with error message
          const alertCalls = (Alert.alert as jest.Mock).mock.calls;
          const lastCall = alertCalls[alertCalls.length - 1];
          
          // Should have title and message
          expect(lastCall).toHaveLength(2);
          expect(lastCall[0]).toBeTruthy(); // Title exists
          expect(lastCall[1]).toBeTruthy(); // Message exists
          
          // Error message should contain error indicator
          const title = lastCall[0].toLowerCase();
          const message = lastCall[1].toLowerCase();
          expect(
            title.includes('lỗi') || 
            title.includes('error') ||
            message.includes('lỗi') ||
            message.includes('error')
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: All actions should always display a notification (never silent failure)
   */
  test('Property 17: All friendship actions should always display notification on completion', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random action type, ID, and success/failure
        fc.tuple(
          fc.constantFrom('sendFriendRequest', 'cancelRequest', 'unfriend'),
          fc.integer({ min: 1, max: 10000 }),
          fc.boolean()
        ),
        async ([actionType, id, shouldSucceed]) => {
          jest.clearAllMocks();

          // Mock service based on success/failure
          if (shouldSucceed) {
            (friendshipService.sendFriendRequest as jest.Mock).mockResolvedValue({
              id: 1,
              userId1: 1,
              userId2: id,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
            });
            (friendshipService.deleteFriendship as jest.Mock).mockResolvedValue(undefined);
          } else {
            const error = new AppError('Test error', 'TEST_ERROR');
            (friendshipService.sendFriendRequest as jest.Mock).mockRejectedValue(error);
            (friendshipService.deleteFriendship as jest.Mock).mockRejectedValue(error);
          }

          const { result } = renderHook(() => useFriendshipActions());

          // Execute the action
          await act(async () => {
            try {
              if (actionType === 'sendFriendRequest') {
                await result.current.sendFriendRequest(id);
              } else if (actionType === 'cancelRequest') {
                await result.current.cancelRequest(id);
              } else {
                await result.current.unfriend(id);
              }
            } catch (error) {
              // Expected for failure cases
            }
          });

          // Wait for state updates
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // The key property: Alert.alert MUST have been called
          // No silent failures - user must always be notified
          expect(Alert.alert).toHaveBeenCalled();
          expect((Alert.alert as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
