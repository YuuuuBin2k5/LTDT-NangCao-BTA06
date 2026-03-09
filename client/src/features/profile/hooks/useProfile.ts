import { useState, useEffect } from 'react';
import { User } from '../../../shared/types/user.types';
import { apiClient } from '../../../services/api/client';
import { ProfileFormData } from '../components/EditProfileForm';
import * as SecureStore from 'expo-secure-store';
import { 
  profileService, 
  ChangePasswordRequest, 
  ContactType 
} from '../../../services/profile/profile.service';

interface UseProfileResult {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  refreshProfile: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  requestContactChange: (newContact: string, type: ContactType) => Promise<void>;
  verifyContactChange: (otpCode: string, type: ContactType) => Promise<void>;
}

import { useAuth } from '../../../store/contexts';

export function useProfile(user: User | null): UseProfileResult {
  const { updateUserLocal } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(user);
  }, [user]);

  const updateProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📝 Updating profile:', data);

      const response = await apiClient.put<{
        message: string;
        user: User;
      }>('/users/profile', {
        nickName: data.nickName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      });

      console.log('✅ Profile updated successfully, response:', response);
      
      // Check if response has user object
      if (!response || !response.user) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Server response không hợp lệ');
      }

      // Update local profile state
      const updatedUser = response.user;
      setProfile(updatedUser);

      // Update stored user data - Create a clean user object
      try {
        const userToStore: User = {
          id: updatedUser.id || user?.id || '',
          username: updatedUser.username || user?.username || '',
          email: updatedUser.email || user?.email || '',
          nickName: updatedUser.nickName || data.nickName,
          avatarUrl: updatedUser.avatarUrl || data.avatarUrl,
          bio: updatedUser.bio || data.bio,
        };
        
        const userJson = JSON.stringify(userToStore);
        await SecureStore.setItemAsync('userData', userJson);
        console.log('✅ User data saved to SecureStore');
        
        // Cập nhật state toàn cục trong AuthContext
        updateUserLocal(userToStore);
      } catch (storeError: any) {
        console.error('⚠️ Failed to save to SecureStore:', storeError.message);
        // Don't throw error, profile is already updated on server
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể cập nhật thông tin';
      console.error('❌ Failed to update profile:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ user: User }>('/users/profile');
      setProfile(response.user);
      
      // Update stored user data and auth state
      await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
      updateUserLocal(response.user);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải thông tin';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Changing password...');
      await profileService.changePassword(data);
      console.log('✅ Password changed successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể đổi mật khẩu';
      console.error('❌ Failed to change password:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestContactChange = async (newContact: string, type: ContactType) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`📧 Requesting ${type} change to:`, newContact);
      
      if (type === ContactType.EMAIL) {
        await profileService.requestEmailChange(newContact);
      } else {
        await profileService.requestPhoneChange(newContact);
      }
      
      console.log(`✅ ${type} change request sent successfully`);
    } catch (err: any) {
      const errorMessage = err.message || `Không thể yêu cầu đổi ${type === ContactType.EMAIL ? 'email' : 'số điện thoại'}`;
      console.error(`❌ Failed to request ${type} change:`, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyContactChange = async (otpCode: string, type: ContactType) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔑 Verifying ${type} change with OTP...`);
      
      if (type === ContactType.EMAIL) {
        await profileService.verifyEmailChange(otpCode);
      } else {
        await profileService.verifyPhoneChange(otpCode);
      }
      
      console.log(`✅ ${type} change verified successfully`);
      
      // Refresh profile to get updated contact info
      await refreshProfile();
    } catch (err: any) {
      const errorMessage = err.message || `Không thể xác thực ${type === ContactType.EMAIL ? 'email' : 'số điện thoại'}`;
      console.error(`❌ Failed to verify ${type} change:`, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
    changePassword,
    requestContactChange,
    verifyContactChange,
  };
}
