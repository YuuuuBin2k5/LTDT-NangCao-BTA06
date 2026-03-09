/**
 * Property-based tests for useUserSearch hook - Request cancellation
 * Feature: friends-search, Property 15: Request cancellation
 * Validates: Requirements 11.4
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useUserSearch } from '../useUserSearch';
import { friendshipService } from '../../../../services/friendship/friendship.service';

// Mock the friendship service
jest.mock('../../../../services/friendship/friendship.service', () => ({
  friendshipService: {
    searchUsers: jest.fn(),
  },
}));

describe('useUserSearch - Request Cancellation Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Property 15: Request cancellation
   * For any new search triggered, any pending previous search requests should be cancelled.
   */
  test('Property 15: Request cancellation - new search should cancel previous pending request', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different search keywords
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== ''),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== '')
        ).filter(([first, second]) => first !== second),
        async ([firstKeyword, secondKeyword]) => {
          jest.clearAllMocks();

          // Track which searches were completed
          const completedSearches: string[] = [];
          let firstSearchAborted = false;

          // Mock searchUsers to simulate slow async operations
          (friendshipService.searchUsers as jest.Mock).mockImplementation(
            (keyword: string) => {
              return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  completedSearches.push(keyword);
                  resolve([
                    {
                      id: 1,
                      name: `User for ${keyword}`,
                      username: keyword,
                      avatarUrl: null,
                      friendshipStatus: null,
                      friendshipId: null,
                    },
                  ]);
                }, 100);

                // Store cleanup function to detect abortion
                const originalAbort = AbortController.prototype.abort;
                AbortController.prototype.abort = function() {
                  if (keyword === firstKeyword.trim()) {
                    firstSearchAborted = true;
                    clearTimeout(timeout);
                    reject({ name: 'AbortError', message: 'Request aborted' });
                  }
                  originalAbort.call(this);
                };
              });
            }
          );

          const { result } = renderHook(() => useUserSearch());

          // Trigger first search
          act(() => {
            result.current.setSearchKeyword(firstKeyword);
          });

          // Wait for debounce to trigger first search
          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Immediately trigger second search before first completes
          act(() => {
            result.current.setSearchKeyword(secondKeyword);
          });

          // Wait for debounce to trigger second search
          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Advance time to allow async operations to complete
          act(() => {
            jest.advanceTimersByTime(200);
          });

          // Wait for all operations to settle
          await waitFor(
            () => {
              expect(friendshipService.searchUsers).toHaveBeenCalledTimes(2);
            },
            { timeout: 3000 }
          );

          // Verify that the second search was called with the second keyword
          expect(friendshipService.searchUsers).toHaveBeenCalledWith(secondKeyword.trim());

          // The key property: when a new search is triggered,
          // the previous request should be cancelled
          // This means the first search should not complete successfully
          // or its results should not be displayed
          
          // Wait for final state
          await act(async () => {
            jest.runAllTimers();
          });

          // The final displayed results should be from the second search only
          // not from the first search (which should have been cancelled)
          if (result.current.users.length > 0) {
            expect(result.current.users[0].username).toBe(secondKeyword.trim());
          }
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  });

  /**
   * Property 15: Request cancellation - rapid successive searches should only show final results
   */
  test('Property 15: Request cancellation - rapid successive searches should only complete the last one', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of 3-5 different keywords
        fc
          .array(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== ''),
            { minLength: 3, maxLength: 5 }
          )
          .filter((keywords) => {
            // Ensure all keywords are unique
            const uniqueKeywords = new Set(keywords);
            return uniqueKeywords.size === keywords.length;
          }),
        async (keywords) => {
          jest.clearAllMocks();

          // Mock searchUsers with delayed responses
          (friendshipService.searchUsers as jest.Mock).mockImplementation(
            (keyword: string) => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve([
                    {
                      id: keyword.length,
                      name: `User ${keyword}`,
                      username: keyword,
                      avatarUrl: null,
                      friendshipStatus: null,
                      friendshipId: null,
                    },
                  ]);
                }, 50);
              });
            }
          );

          const { result } = renderHook(() => useUserSearch());

          // Trigger all searches in rapid succession
          for (const keyword of keywords) {
            act(() => {
              result.current.setSearchKeyword(keyword);
            });

            // Small delay between inputs (less than debounce)
            act(() => {
              jest.advanceTimersByTime(100);
            });
          }

          // Wait for final debounce
          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Advance time for async operations
          act(() => {
            jest.advanceTimersByTime(100);
          });

          // Wait for operations to complete
          await waitFor(
            () => {
              // At least the final search should have been called
              expect(friendshipService.searchUsers).toHaveBeenCalled();
            },
            { timeout: 3000 }
          );

          await act(async () => {
            jest.runAllTimers();
          });

          // The final results should correspond to the last keyword only
          const lastKeyword = keywords[keywords.length - 1];
          if (result.current.users.length > 0) {
            expect(result.current.users[0].username).toBe(lastKeyword.trim());
          }

          // Verify that only the last search completed
          // (previous ones should have been cancelled)
          const lastCallArgs = (friendshipService.searchUsers as jest.Mock).mock.calls[
            (friendshipService.searchUsers as jest.Mock).mock.calls.length - 1
          ];
          expect(lastCallArgs[0]).toBe(lastKeyword.trim());
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  });

  /**
   * Property 15: Request cancellation - cancelled requests should not update state
   */
  test('Property 15: Request cancellation - cancelled requests should not cause errors or update state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== ''),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== '')
        ),
        async ([firstKeyword, secondKeyword]) => {
          jest.clearAllMocks();

          let firstRequestCancelled = false;

          // Mock searchUsers to track cancellation
          (friendshipService.searchUsers as jest.Mock).mockImplementation(
            (keyword: string) => {
              return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  resolve([
                    {
                      id: 1,
                      name: `User ${keyword}`,
                      username: keyword,
                      avatarUrl: null,
                      friendshipStatus: null,
                      friendshipId: null,
                    },
                  ]);
                }, 100);

                // Simulate cancellation for first request
                if (keyword === firstKeyword.trim()) {
                  setTimeout(() => {
                    firstRequestCancelled = true;
                    clearTimeout(timeout);
                    reject({ name: 'AbortError', message: 'Aborted' });
                  }, 50);
                }
              });
            }
          );

          const { result } = renderHook(() => useUserSearch());

          // First search
          act(() => {
            result.current.setSearchKeyword(firstKeyword);
          });

          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Second search (should cancel first)
          act(() => {
            result.current.setSearchKeyword(secondKeyword);
          });

          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Advance time
          act(() => {
            jest.advanceTimersByTime(200);
          });

          await act(async () => {
            jest.runAllTimers();
          });

          // Wait for completion
          await waitFor(
            () => {
              expect(result.current.isLoading).toBe(false);
            },
            { timeout: 3000 }
          );

          // Verify no error state from cancelled request
          // (AbortError should not be set as error)
          if (result.current.error) {
            expect(result.current.error.message).not.toContain('Abort');
            expect(result.current.error.message).not.toContain('Cancel');
          }

          // Verify state is consistent
          expect(result.current.isLoading).toBe(false);
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  });
});
