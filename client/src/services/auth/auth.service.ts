import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/client';
import { AuthService } from '../../shared/types/service.types';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../../shared/types/user.types';
import { AuthError } from '../../shared/types/error.types';

/**
 * Authentication service implementation
 * Handles all authentication-related operations
 */
class AuthServiceImpl implements AuthService {
  private readonly TOKEN_KEY = 'userToken';
  private readonly USER_KEY = 'userData';

  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login with:', { email: credentials.email });
      
      const response = await apiClient.post<{
        message: string;
        token: string;
        userId: string;
        nickName: string;
      }>('/auth/login', credentials);

      console.log('✅ Login successful:', { userId: response.userId, nickName: response.nickName });

      // Store token securely
      await SecureStore.setItemAsync(this.TOKEN_KEY, response.token);
      console.log('💾 Token saved to SecureStore');

      // Create user object from response
      const user: User = {
        id: response.userId,
        username: credentials.email, // Use email as username for now
        email: credentials.email,
        nickName: response.nickName,
      };

      // Store user data
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));

      return {
        token: response.token,
        user,
      };
    } catch (error: any) {
      // Extract meaningful error message
      const errorMessage = error?.message || 'Đăng nhập thất bại';
      console.error('❌ Login failed:', { 
        email: credentials.email,
        error: errorMessage,
        fullError: error 
      });
      throw new AuthError(errorMessage, error);
    }
  }

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<void> {
    try {
      await apiClient.post('/auth/register', data);
      // Store email for OTP verification
      await SecureStore.setItemAsync('pendingEmail', data.email);
    } catch (error: any) {
      const errorMessage = error?.message || 'Đăng ký thất bại';
      console.error('Register error details:', error);
      throw new AuthError(errorMessage, error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Clear stored token and user data
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.USER_KEY);
    } catch (error) {
      throw new AuthError('Đăng xuất thất bại', error);
    }
  }

  /**
   * Refresh authentication token
   * Note: Current backend doesn't have refresh endpoint, 
   * this is a placeholder for future implementation
   */
  async refreshToken(): Promise<string> {
    try {
      // TODO: Implement when backend supports token refresh
      const currentToken = await SecureStore.getItemAsync(this.TOKEN_KEY);
      if (!currentToken) {
        throw new Error('No token to refresh');
      }
      
      // Placeholder - would call refresh endpoint
      // const response = await apiClient.post<{ token: string }>('/auth/refresh', { token: currentToken });
      // await SecureStore.setItemAsync(this.TOKEN_KEY, response.token);
      // return response.token;
      
      return currentToken;
    } catch (error) {
      throw new AuthError('Làm mới token thất bại', error);
    }
  }

  /**
   * Verify OTP code for registration
   */
  async verifyOTP(code: string): Promise<void> {
    try {
      // Get email from temporary storage (should be set during registration)
      const email = await SecureStore.getItemAsync('pendingEmail');
      if (!email) {
        throw new Error('No pending email verification');
      }

      const response = await apiClient.post<{
        message: string;
        token: string;
        userId: string;
        nickName: string;
      }>('/auth/verify-registration', { email, otpCode: code });

      // Store token after successful verification
      await SecureStore.setItemAsync(this.TOKEN_KEY, response.token);

      // Create and store user data
      const user: User = {
        id: response.userId,
        username: email,
        email,
        nickName: response.nickName,
      };
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));

      // Clear pending email
      await SecureStore.deleteItemAsync('pendingEmail');
    } catch (error) {
      throw new AuthError('Xác thực OTP thất bại', error);
    }
  }

  /**
   * Resend OTP code to email
   */
  async resendOTP(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/resend-otp', { email });
    } catch (error) {
      throw new AuthError('Gửi lại OTP thất bại', error);
    }
  }

  /**
   * Request password reset (sends OTP to email)
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      // Store email for reset password flow
      await SecureStore.setItemAsync('resetEmail', email);
    } catch (error) {
      throw new AuthError('Yêu cầu đặt lại mật khẩu thất bại', error);
    }
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(otp: string, newPassword: string): Promise<void> {
    try {
      const email = await SecureStore.getItemAsync('resetEmail');
      if (!email) {
        throw new Error('No pending password reset');
      }

      await apiClient.post('/auth/reset-password', {
        email,
        otpCode: otp,
        newPassword,
      });

      // Clear reset email
      await SecureStore.deleteItemAsync('resetEmail');
    } catch (error) {
      throw new AuthError('Đặt lại mật khẩu thất bại', error);
    }
  }

  /**
   * Get stored authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  async getUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Store pending email for OTP verification
   */
  async setPendingEmail(email: string): Promise<void> {
    await SecureStore.setItemAsync('pendingEmail', email);
  }
}

// Export singleton instance
export const authService = new AuthServiceImpl();
