// Profile feature type definitions

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  nickName: string;
  avatarUrl?: string;
  bio?: string;
}

export interface ProfileSettings {
  notifications: boolean;
  locationSharing: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface ProfileState {
  profile: UserProfile | null;
  settings: ProfileSettings;
  isLoading: boolean;
}
