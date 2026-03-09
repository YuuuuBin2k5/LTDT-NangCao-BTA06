/**
 * Service interface definitions
 */

import { LoginCredentials, RegisterData, AuthResponse } from './user.types';
import { Location } from './location.types';
import { RequestConfig } from './api.types';

/**
 * API Client interface
 */
export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

/**
 * Authentication Service interface
 */
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<void>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
  verifyOTP(code: string): Promise<void>;
  resendOTP(email: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

/**
 * Location Service interface
 */
export interface LocationService {
  getCurrentLocation(): Promise<Location>;
  watchLocation(callback: (location: Location) => void): () => void;
  updateLocation(location: Location): Promise<void>;
  stopWatching(): void;
}
