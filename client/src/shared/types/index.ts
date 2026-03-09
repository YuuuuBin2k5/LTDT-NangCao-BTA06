// Export shared types
// Common TypeScript types and interfaces will be added here as they are created

// User types
export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from './user.types';

// Location types
export type {
  Location,
  LocationUpdate,
} from './location.types';

// API types
export type {
  ApiResponse,
  ApiError,
  RequestConfig,
  PaginatedResponse,
} from './api.types';

// Error types
export {
  AppError,
  ApiError as ApiErrorClass,
  AuthError,
  ValidationError,
  NetworkError,
} from './error.types';

// Service interfaces
export type {
  ApiClient,
  AuthService,
  LocationService,
} from './service.types';

// Friendship types
export {
  FriendshipStatus,
  FriendAction,
} from './friendship.types';

export type {
  UserSearchResult,
} from './friendship.types';
