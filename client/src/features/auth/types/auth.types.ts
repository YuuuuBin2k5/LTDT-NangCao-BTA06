// Auth-specific types

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nickName: string;
  urlAvatar?: string;
  bio?: string;
}

export interface OTPVerification {
  otpCode: string;
}

export interface PasswordReset {
  email: string;
  otpCode: string;
  newPassword: string;
}
