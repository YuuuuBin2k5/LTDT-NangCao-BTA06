/**
 * Application-wide constants
 */

/**
 * Storage keys for AsyncStorage and SecureStore
 */
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  LANGUAGE: 'language',
  THEME: 'theme',
  LOCATION_PERMISSION: 'locationPermission',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
} as const;

/**
 * App configuration values
 */
export const APP_CONFIG = {
  // App name
  APP_NAME: 'Mapic',
  
  // Version
  VERSION: '1.0.0',
  
  // Default language
  DEFAULT_LANGUAGE: 'vi',
  
  // Location tracking interval (ms)
  LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds
  
  // Location tracking distance filter (meters)
  LOCATION_DISTANCE_FILTER: 10, // 10 meters
  
  // Map default zoom level
  MAP_DEFAULT_ZOOM: 15,
  
  // Map default region
  MAP_DEFAULT_REGION: {
    latitude: 21.0285, // Hanoi
    longitude: 105.8542,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // OTP configuration
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 5,
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  
  // Username requirements
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  
  // Debounce delays (ms)
  SEARCH_DEBOUNCE: 300,
  INPUT_DEBOUNCE: 500,
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_VN: /^(0|\+84|84)[0-9]{9}$/,
  USERNAME: /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/,
} as const;

/**
 * Date/Time formats
 */
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định',
  INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không đúng',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  PERMISSION_DENIED: 'Bạn không có quyền thực hiện thao tác này',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',
  SEND_SUCCESS: 'Gửi thành công',
} as const;

/**
 * Animation durations (ms)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  BACKGROUND: 0,
  CONTENT: 1,
  OVERLAY: 10,
  MODAL: 100,
  TOAST: 1000,
  TOOLTIP: 1001,
} as const;
