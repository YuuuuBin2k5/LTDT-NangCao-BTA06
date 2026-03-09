import * as ExpoLocation from 'expo-location';
import axios, { CancelTokenSource } from 'axios';
import { Location, PrivacyMode, LocationUpdateRequest } from '../../shared/types/location.types';
import { apiClient } from '../api/client';
import { AppError } from '../../shared/types/error.types';

/**
 * Place category enum
 */
export enum PlaceCategory {
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  PARK = 'PARK',
  MUSEUM = 'MUSEUM',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER'
}

/**
 * Place interface representing a location
 */
export interface Place {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  category: PlaceCategory;
  coverImageUrl?: string;
}

/**
 * PlaceDetails interface extending Place with additional fields
 */
export interface PlaceDetails extends Place {
  coverImageUrl: string;
  address: string;
}

/**
 * ReviewAuthor interface representing review author information
 */
export interface ReviewAuthor {
  id: number;
  name: string;
  avatarUrl: string | null;
}

/**
 * Review interface representing a place review
 */
export interface Review {
  id: number;
  content: string;
  rating: number;
  isPublic: boolean;
  createdAt: string;
  author: ReviewAuthor;
}

/**
 * Search places parameters
 */
export interface SearchPlacesParams {
  keyword?: string;
  category?: PlaceCategory;
  minRating?: number;
  hasPost?: boolean;
  page?: number;
  size?: number;
}

/**
 * Paged response wrapper
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * LocationService interface defining location-related operations
 */
export interface LocationService {
  getCurrentLocation(): Promise<Location>;
  watchLocation(callback: (location: Location) => void): () => void;
  updateLocation(location: Location, options?: { privacyMode?: PrivacyMode; statusMessage?: string; statusEmoji?: string }): Promise<void>;
  searchPlaces(params: SearchPlacesParams, cancelToken?: CancelTokenSource): Promise<PagedResponse<Place>>;
  fetchPlaceDetails(placeId: number): Promise<PlaceDetails>;
  fetchPlaceReviews(placeId: number): Promise<Review[]>;
}

/**
 * LocationService implementation using expo-location
 */
class LocationServiceImpl implements LocationService {
  private watchSubscription: ExpoLocation.LocationSubscription | null = null;

  /**
   * Get current device location
   * @returns Promise<Location> Current location
   * @throws AppError if location permissions are denied or location fetch fails
   */
  async getCurrentLocation(): Promise<Location> {
    try {
      // Request location permissions
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new AppError(
          'Quyền truy cập vị trí bị từ chối',
          'LOCATION_PERMISSION_DENIED'
        );
      }

      // Get current position
      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      return this.transformExpoLocation(position);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'Không thể lấy vị trí hiện tại',
        'LOCATION_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Watch location changes and invoke callback on updates
   * @param callback Function to call when location changes
   * @returns Function to stop watching location
   */
  watchLocation(callback: (location: Location) => void): () => void {
    // Start watching location
    this.startWatching(callback);

    // Return cleanup function
    return () => {
      this.stopWatching();
    };
  }

  /**
   * Update location on the server
   * @param location Location to update
   * @param options Optional privacy mode and status
   * @throws AppError if API call fails
   */
  async updateLocation(
    location: Location,
    options?: { privacyMode?: PrivacyMode; statusMessage?: string; statusEmoji?: string }
  ): Promise<void> {
    try {
      console.log('📍 Updating location on server:', {
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
        privacyMode: options?.privacyMode,
      });

      const request: LocationUpdateRequest = {
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
        timestamp: location.timestamp,
        privacyMode: options?.privacyMode,
        statusMessage: options?.statusMessage,
        statusEmoji: options?.statusEmoji,
      };

      await apiClient.post('/locations/update', request);

      console.log('✅ Location updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update location:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });
      throw new AppError(
        'Không thể cập nhật vị trí',
        'LOCATION_UPDATE_ERROR',
        error
      );
    }
  }

  /**
   * Search places with filters and pagination
   * @param params Search parameters including keyword, category, minRating, page, and size
   * @param cancelToken Optional cancel token for request cancellation
   * @returns Promise<PagedResponse<Place>> Paginated search results
   * @throws AppError if API call fails
   */
  async searchPlaces(
    params: SearchPlacesParams,
    cancelToken?: CancelTokenSource
  ): Promise<PagedResponse<Place>> {
    try {
      console.log('🔍 Searching places with params:', params);

      // Build query parameters
      const queryParams: Record<string, any> = {};
      
      if (params.keyword !== undefined && params.keyword !== '') {
        queryParams.keyword = params.keyword;
      }
      
      if (params.category !== undefined && params.category !== null) {
        queryParams.category = params.category;
      }
      
      if (params.minRating !== undefined && params.minRating !== null) {
        queryParams.minRating = params.minRating;
      }
      
      if (params.hasPost !== undefined && params.hasPost !== null) {
        queryParams.hasPost = params.hasPost;
      }
      
      if (params.page !== undefined) {
        queryParams.page = params.page;
      }
      
      if (params.size !== undefined) {
        queryParams.size = params.size;
      }

      // Make API request with optional cancellation support
      const response = await apiClient.get<PagedResponse<Place>>(
        '/places/search',
        {
          params: queryParams,
          ...(cancelToken && { cancelToken: cancelToken.token }),
        }
      );

      console.log('✅ Places search successful:', {
        totalElements: response.totalElements,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
      });

      return response;
    } catch (error: any) {
      // Check if request was cancelled
      if (axios.isCancel(error)) {
        console.log('🚫 Search request cancelled');
        throw new AppError(
          'Yêu cầu tìm kiếm đã bị hủy',
          'SEARCH_CANCELLED',
          error
        );
      }

      console.error('❌ Failed to search places:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      throw new AppError(
        'Không thể tìm kiếm địa điểm',
        'PLACE_SEARCH_ERROR',
        error
      );
    }
  }

  /**
   * Fetch detailed information for a specific place
   * @param placeId ID of the place to fetch
   * @returns Promise<PlaceDetails> Place details including cover image and address
   * @throws AppError if API call fails or place not found
   */
  async fetchPlaceDetails(placeId: number): Promise<PlaceDetails> {
    try {
      console.log('📍 Fetching place details for ID:', placeId);

      const response = await apiClient.get<PlaceDetails>(`/places/${placeId}`);

      console.log('✅ Place details fetched successfully:', {
        id: response.id,
        name: response.name,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to fetch place details:', {
        placeId,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      // Handle 404 specifically
      if (error?.status === 404) {
        throw new AppError(
          'Địa điểm không tồn tại',
          'PLACE_NOT_FOUND',
          error
        );
      }

      throw new AppError(
        'Không thể tải thông tin địa điểm',
        'PLACE_DETAILS_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Fetch reviews for a specific place
   * @param placeId ID of the place to fetch reviews for
   * @returns Promise<Review[]> Array of reviews with permission-based filtering
   * @throws AppError if API call fails
   */
  async fetchPlaceReviews(placeId: number): Promise<Review[]> {
    try {
      console.log('💬 Fetching reviews for place ID:', placeId);

      const response = await apiClient.get<Review[]>(`/places/${placeId}/reviews`);

      console.log('✅ Reviews fetched successfully:', {
        placeId,
        reviewCount: response.length,
      });

      return response;
    } catch (error: any) {
      console.error('❌ Failed to fetch reviews:', {
        placeId,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        fullError: error,
      });

      // Handle 401 specifically (authentication required)
      if (error?.status === 401) {
        throw new AppError(
          'Vui lòng đăng nhập để xem bình luận',
          'AUTHENTICATION_REQUIRED',
          error
        );
      }

      throw new AppError(
        'Không thể tải bình luận',
        'REVIEWS_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Start watching location changes
   * @private
   */
  private async startWatching(callback: (location: Location) => void): Promise<void> {
    try {
      // Request location permissions
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new AppError(
          'Quyền truy cập vị trí bị từ chối',
          'LOCATION_PERMISSION_DENIED'
        );
      }

      // Start watching location
      this.watchSubscription = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (position) => {
          const location = this.transformExpoLocation(position);
          callback(location);
        }
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'Không thể theo dõi vị trí',
        'LOCATION_WATCH_ERROR',
        error
      );
    }
  }

  /**
   * Stop watching location changes
   * @private
   */
  private stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
  }

  /**
   * Transform expo-location position to app Location type
   * @private
   */
  private transformExpoLocation(position: ExpoLocation.LocationObject): Location {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      heading: position.coords.heading ?? undefined,
      speed: position.coords.speed ?? undefined,
      timestamp: position.timestamp,
    };
  }
}

// Create and export singleton instance
export const locationService = new LocationServiceImpl();
