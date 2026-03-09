import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrivacyMode } from '../../../shared/types/location.types';
import { friendLocationService } from '../../../services/location/friend-location.service';

const PRIVACY_MODE_KEY = '@location_privacy_mode';
const CLOSE_FRIENDS_KEY = '@close_friends_list';

interface LocationPrivacyState {
  privacyMode: PrivacyMode;
  closeFriendIds: string[];
  isLoading: boolean;
  setPrivacyMode: (mode: PrivacyMode) => Promise<void>;
  updateCloseFriends: (friendIds: string[]) => Promise<void>;
  loadPrivacySettings: () => Promise<void>;
}

export const useLocationPrivacyStore = create<LocationPrivacyState>((set, get) => ({
  privacyMode: PrivacyMode.ALL_FRIENDS,
  closeFriendIds: [],
  isLoading: true,

  loadPrivacySettings: async () => {
    try {
      const [modeStr, friendsStr] = await Promise.all([
        AsyncStorage.getItem(PRIVACY_MODE_KEY),
        AsyncStorage.getItem(CLOSE_FRIENDS_KEY),
      ]);

      if (modeStr) {
        set({ privacyMode: modeStr as PrivacyMode });
      }

      if (friendsStr) {
        set({ closeFriendIds: JSON.parse(friendsStr) });
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setPrivacyMode: async (mode: PrivacyMode) => {
    try {
      set({ privacyMode: mode });
      await AsyncStorage.setItem(PRIVACY_MODE_KEY, mode);
      await friendLocationService.updatePrivacyMode(mode);
    } catch (error) {
      console.error('Failed to update privacy mode:', error);
      throw error;
    }
  },

  updateCloseFriends: async (friendIds: string[]) => {
    try {
      set({ closeFriendIds: friendIds });
      await AsyncStorage.setItem(CLOSE_FRIENDS_KEY, JSON.stringify(friendIds));
    } catch (error) {
      console.error('Failed to update close friends list:', error);
      throw error;
    }
  },
}));
