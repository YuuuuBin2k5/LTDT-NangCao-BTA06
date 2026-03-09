import { apiClient } from '../api/client';
import { ApiError } from '../../shared/types/error.types';

/**
 * Contact type enum matching backend
 */
export enum ContactType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

/**
 * Request/Response types for profile operations
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ChangeContactRequest {
  newContact: string;
  type: ContactType;
}

export interface ChangeContactResponse {
  message: string;
}

export interface VerifyContactChangeRequest {
  otpCode: string;
  type: ContactType;
}

export interface VerifyContactChangeResponse {
  message: string;
}

/**
 * Profile service implementation
 * Handles profile and security-related operations
 */
class ProfileServiceImpl {
  /**
   * Change user password
   * @param data - Current and new password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.put<ChangePasswordResponse>(
        '/users/password',
        data
      );
      return response;
    } catch (error: any) {
      const errorMessage = error?.message || 'Đổi mật khẩu thất bại';
      throw new ApiError(errorMessage, 'CHANGE_PASSWORD_FAILED', error?.status || 500, error);
    }
  }

  /**
   * Request email change (sends OTP to new email)
   * @param newEmail - New email address
   */
  async requestEmailChange(newEmail: string): Promise<ChangeContactResponse> {
    try {
      const response = await apiClient.post<ChangeContactResponse>(
        '/users/contact/request',
        {
          newContact: newEmail,
          type: ContactType.EMAIL,
        }
      );
      return response;
    } catch (error: any) {
      const errorMessage = error?.message || 'Yêu cầu đổi email thất bại';
      throw new ApiError(errorMessage, 'REQUEST_EMAIL_CHANGE_FAILED', error?.status || 500, error);
    }
  }

  /**
   * Verify email change with OTP
   * @param otpCode - OTP code received via email
   */
  async verifyEmailChange(otpCode: string): Promise<VerifyContactChangeResponse> {
    try {
      const response = await apiClient.post<VerifyContactChangeResponse>(
        '/users/contact/verify',
        {
          otpCode,
          type: ContactType.EMAIL,
        }
      );
      return response;
    } catch (error: any) {
      const errorMessage = error?.message || 'Xác thực OTP email thất bại';
      throw new ApiError(errorMessage, 'VERIFY_EMAIL_CHANGE_FAILED', error?.status || 500, error);
    }
  }

  /**
   * Request phone change (sends OTP to new phone)
   * @param newPhone - New phone number
   */
  async requestPhoneChange(newPhone: string): Promise<ChangeContactResponse> {
    try {
      const response = await apiClient.post<ChangeContactResponse>(
        '/users/contact/request',
        {
          newContact: newPhone,
          type: ContactType.PHONE,
        }
      );
      return response;
    } catch (error: any) {
      const errorMessage = error?.message || 'Yêu cầu đổi số điện thoại thất bại';
      throw new ApiError(errorMessage, 'REQUEST_PHONE_CHANGE_FAILED', error?.status || 500, error);
    }
  }

  /**
   * Verify phone change with OTP
   * @param otpCode - OTP code received via SMS
   */
  async verifyPhoneChange(otpCode: string): Promise<VerifyContactChangeResponse> {
    try {
      const response = await apiClient.post<VerifyContactChangeResponse>(
        '/users/contact/verify',
        {
          otpCode,
          type: ContactType.PHONE,
        }
      );
      return response;
    } catch (error: any) {
      const errorMessage = error?.message || 'Xác thực OTP số điện thoại thất bại';
      throw new ApiError(errorMessage, 'VERIFY_PHONE_CHANGE_FAILED', error?.status || 500, error);
    }
  }
}

// Export singleton instance
export const profileService = new ProfileServiceImpl();
