/**
 * Property-based tests for useUserSearch hook - Debounce timing
 * Feature: friends-search, Property 14: Debounce timing
 * Validates: Requirements 1.4, 11.1, 11.2, 11.3
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

describe('useUserSearch - Debounce Timing Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock successful search response
    (friendshipService.searchUsers as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Property 14: Debounce timing
   * For any sequence of rapid input changes within 500ms,
   * only the final value should trigger an API request after the debounce period.
   */
  test('Property 14: Debounce timing - rapid input changes within 500ms should only trigger one API call', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of 2-10 search keywords
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
        // Generate delays between inputs (all less than 500ms)
        fc.array(fc.integer({ min: 10, max: 400 }), { minLength: 1, maxLength: 9 }),
        async (keywords, delays) => {
          // Reset mocks for this iteration
          jest.clearAllMocks();
          
          const { result } = renderHook(() => useUserSearch());

          // Simulate rapid input changes
          for (let i = 0; i < keywords.length; i++) {
            act(() => {
              result.current.setSearchKeyword(keywords[i]);
            });

            // Advance time by the delay (but not enough to trigger debounce)
            if (i < delays.length) {
              act(() => {
                jest.advanceTimersByTime(delays[i]);
              });
            }
          }

          // At this point, no API call should have been made yet
          // because we haven't waited the full 500ms after the last input
          expect(friendshipService.searchUsers).not.toHaveBeenCalled();

          // Now advance time by 500ms to trigger the debounce
          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Wait for the async operation to complete
          await waitFor(() => {
            // If the last keyword is not empty, expect a call
            const lastKeyword = keywords[keywords.length - 1];
            if (lastKeyword.trim() !== '') {
              expect(friendshipService.searchUsers).toHaveBeenCalled();
            }
          });

          // Verify that at most ONE API call was made (for the final keyword)
          const lastKeyword = keywords[keywords.length - 1];
          if (lastKeyword.trim() !== '') {
            expect(friendshipService.searchUsers).toHaveBeenCalledTimes(1);
            expect(friendshipService.searchUsers).toHaveBeenCalledWith(lastKeyword.trim());
          } else {
            // Empty keyword should not trigger API call
            expect(friendshipService.searchUsers).not.toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  test('Property 14: Debounce timing - input followed by 500ms+ delay should trigger API call', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 500, max: 1000 }),
        async (keyword, delay) => {
          jest.clearAllMocks();
          
          const { result } = renderHook(() => useUserSearch());

          // Set search keyword
          act(() => {
            result.current.setSearchKeyword(keyword);
          });

          // Advance time by the delay (>= 500ms)
          act(() => {
            jest.advanceTimersByTime(delay);
          });

          // Wait for the async operation
          await waitFor(() => {
            if (keyword.trim() !== '') {
              expect(friendshipService.searchUsers).toHaveBeenCalled();
            }
          });

          // Verify API was called exactly once if keyword is not empty
          if (keyword.trim() !== '') {
            expect(friendshipService.searchUsers).toHaveBeenCalledTimes(1);
            expect(friendshipService.searchUsers).toHaveBeenCalledWith(keyword.trim());
          } else {
            expect(friendshipService.searchUsers).not.toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14: Debounce timing - multiple sequences with proper delays should trigger multiple calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== ''),
          { minLength: 2, maxLength: 5 }
        ),
        async (keywords) => {
          jest.clearAllMocks();
          
          const { result } = renderHook(() => useUserSearch());

          // For each keyword, set it and wait for debounce to complete
          for (const keyword of keywords) {
            act(() => {
              result.current.setSearchKeyword(keyword);
            });

            // Wait for debounce period
            act(() => {
              jest.advanceTimersByTime(500);
            });

            // Wait for API call
            await waitFor(() => {
              expect(friendshipService.searchUsers).toHaveBeenCalled();
            });
          }

          // Verify API was called once for each keyword
          expect(friendshipService.searchUsers).toHaveBeenCalledTimes(keywords.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14: Debounce timing - empty keyword should clear results without API call', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() !== ''),
        async (keyword) => {
          jest.clearAllMocks();
          
          const { result } = renderHook(() => useUserSearch());

          // First, set a non-empty keyword
          act(() => {
            result.current.setSearchKeyword(keyword);
          });

          act(() => {
            jest.advanceTimersByTime(500);
          });

          await waitFor(() => {
            expect(friendshipService.searchUsers).toHaveBeenCalledTimes(1);
          });

          jest.clearAllMocks();

          // Now set empty keyword
          act(() => {
            result.current.setSearchKeyword('');
          });

          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Run all pending timers and promises
          await act(async () => {
            jest.runAllTimers();
          });

          // Verify no API call was made for empty keyword
          expect(friendshipService.searchUsers).not.toHaveBeenCalled();

          // Verify users array is empty
          expect(result.current.users).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  }, 10000);
});
