import { useCallback } from 'react';
import { useLocationPrivacyStore } from '../store/locationPrivacyStore';
import { PrivacyMode } from '../../../shared/types/location.types';

/**
 * Hook for managing location privacy settings using centralized store
 */
export const useLocationPrivacy = () => {
  const {
    privacyMode,
    closeFriendIds,
    isLoading,
    setPrivacyMode,
    updateCloseFriends,
    loadPrivacySettings,
  } = useLocationPrivacyStore();

  /**
   * Toggle friend in close friends list
   */
  const toggleCloseFriend = useCallback(
    async (friendId: string) => {
      const newList = closeFriendIds.includes(friendId)
        ? closeFriendIds.filter((id) => id !== friendId)
        : [...closeFriendIds, friendId];

      await updateCloseFriends(newList);
    },
    [closeFriendIds, updateCloseFriends]
  );

  /**
   * Check if user is in close friends
   */
  const isCloseFriend = useCallback(
    (friendId: string) => {
      return closeFriendIds.includes(friendId);
    },
    [closeFriendIds]
  );

  /**
   * Enable Ghost Mode
   */
  const enableGhostMode = useCallback(async () => {
    await setPrivacyMode(PrivacyMode.GHOST_MODE);
  }, [setPrivacyMode]);

  /**
   * Disable Ghost Mode (return to previous mode)
   */
  const disableGhostMode = useCallback(async () => {
    await setPrivacyMode(PrivacyMode.ALL_FRIENDS);
  }, [setPrivacyMode]);

  return {
    privacyMode,
    closeFriendIds,
    isLoading,
    setPrivacyMode,
    updateCloseFriends,
    toggleCloseFriend,
    isCloseFriend,
    enableGhostMode,
    disableGhostMode,
    loadPrivacySettings,
  };
};
