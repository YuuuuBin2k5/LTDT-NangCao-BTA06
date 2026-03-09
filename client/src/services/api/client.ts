import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ApiError, NetworkError } from '../../shared/types/error.types';
import { RequestConfig } from '../../shared/types/api.types';
import { API_BASE_URL, API_TIMEOUT } from '../../shared/constants/api.constants';

/**
 * API Client interface defining core HTTP methods
 */
export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

/**
 * Base API client implementation using axios
 */
class ApiClientImpl implements ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync('userToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Token added to request:', config.url, '| Token:', token.substring(0, 20) + '...');
          } else {
            console.warn('⚠️ No token found for request:', config.url);
          }
        } catch (error) {
          console.error('❌ Failed to retrieve token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.transformError(error));
      }
    );

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Transform axios errors into application-specific errors
   */
  private transformError(error: unknown): Error {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network error (no response)
      if (!axiosError.response) {
        return new NetworkError(
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
          axiosError
        );
      }

      // HTTP error with response
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      const message = data?.message || axiosError.message || 'Đã xảy ra lỗi';
      const code = data?.code || `HTTP_${status}`;

      return new ApiError(message, code, status, axiosError);
    }

    // Unknown error
    if (error instanceof Error) {
      return error;
    }

    return new Error('Đã xảy ra lỗi không xác định');
  }

  /**
   * Convert RequestConfig to AxiosRequestConfig
   */
  private toAxiosConfig(config?: RequestConfig): AxiosRequestConfig {
    if (!config) return {};

    return {
      headers: config.headers,
      params: config.params,
      timeout: config.timeout,
      cancelToken: (config as any).cancelToken, // Support cancel token
    };
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(
      url,
      this.toAxiosConfig(config)
    );
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(
      url,
      data,
      this.toAxiosConfig(config)
    );
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(
      url,
      data,
      this.toAxiosConfig(config)
    );
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(
      url,
      data,
      this.toAxiosConfig(config)
    );
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(
      url,
      this.toAxiosConfig(config)
    );
    return response.data;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClientImpl(API_BASE_URL);
