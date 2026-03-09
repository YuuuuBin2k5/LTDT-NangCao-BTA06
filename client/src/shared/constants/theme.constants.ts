/**
 * Theme and styling constants
 */

/**
 * Color palette
 */
export const COLORS = {
  // Primary colors
  PRIMARY: '#007AFF',
  PRIMARY_DARK: '#0051D5',
  PRIMARY_LIGHT: '#4DA2FF',
  
  // Secondary colors
  SECONDARY: '#5856D6',
  SECONDARY_DARK: '#3634A3',
  SECONDARY_LIGHT: '#7D7AFF',
  
  // Accent colors
  ACCENT: '#FF9500',
  ACCENT_DARK: '#CC7700',
  ACCENT_LIGHT: '#FFB340',
  
  // Neutral colors
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
  
  // Semantic colors
  SUCCESS: '#34C759',
  SUCCESS_LIGHT: '#D1F4E0',
  WARNING: '#FF9500',
  WARNING_LIGHT: '#FFE5B4',
  ERROR: '#FF3B30',
  ERROR_LIGHT: '#FFE5E5',
  INFO: '#007AFF',
  INFO_LIGHT: '#D6EAFF',
  
  // Background colors
  BACKGROUND: '#FFFFFF',
  BACKGROUND_SECONDARY: '#F9FAFB',
  BACKGROUND_TERTIARY: '#F3F4F6',
  
  // Text colors
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#6B7280',
  TEXT_TERTIARY: '#9CA3AF',
  TEXT_DISABLED: '#D1D5DB',
  TEXT_INVERSE: '#FFFFFF',
  
  // Border colors
  BORDER: '#E5E7EB',
  BORDER_LIGHT: '#F3F4F6',
  BORDER_DARK: '#D1D5DB',
  
  // Overlay
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.3)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',
  
  // Transparent
  TRANSPARENT: 'transparent',
} as const;

/**
 * Typography
 */
export const TYPOGRAPHY = {
  // Font families
  FONT_FAMILY: {
    REGULAR: 'System',
    MEDIUM: 'System',
    BOLD: 'System',
  },
  
  // Font sizes
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    '2XL': 24,
    '3XL': 30,
    '4XL': 36,
    '5XL': 48,
  },
  
  // Font weights
  FONT_WEIGHT: {
    LIGHT: '300' as const,
    REGULAR: '400' as const,
    MEDIUM: '500' as const,
    SEMIBOLD: '600' as const,
    BOLD: '700' as const,
  },
  
  // Line heights
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.5,
    RELAXED: 1.75,
    LOOSE: 2,
  },
} as const;

/**
 * Spacing scale (based on 4px grid)
 */
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  '2XL': 40,
  '3XL': 48,
  '4XL': 64,
  '5XL': 80,
} as const;

/**
 * Border radius
 */
export const BORDER_RADIUS = {
  NONE: 0,
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  '2XL': 24,
  FULL: 9999,
} as const;

/**
 * Border width
 */
export const BORDER_WIDTH = {
  NONE: 0,
  THIN: 1,
  MEDIUM: 2,
  THICK: 4,
} as const;

/**
 * Shadows
 */
export const SHADOWS = {
  NONE: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  XL: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

/**
 * Opacity levels
 */
export const OPACITY = {
  DISABLED: 0.5,
  HOVER: 0.8,
  PRESSED: 0.6,
} as const;

/**
 * Icon sizes
 */
export const ICON_SIZE = {
  XS: 16,
  SM: 20,
  MD: 24,
  LG: 32,
  XL: 40,
  '2XL': 48,
} as const;

/**
 * Button sizes
 */
export const BUTTON_SIZE = {
  SM: {
    height: 32,
    paddingHorizontal: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
  },
  MD: {
    height: 40,
    paddingHorizontal: SPACING.LG,
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
  },
  LG: {
    height: 48,
    paddingHorizontal: SPACING.XL,
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
  },
} as const;

/**
 * Input sizes
 */
export const INPUT_SIZE = {
  SM: {
    height: 32,
    paddingHorizontal: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZE.SM,
  },
  MD: {
    height: 40,
    paddingHorizontal: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZE.BASE,
  },
  LG: {
    height: 48,
    paddingHorizontal: SPACING.LG,
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
  },
} as const;

/**
 * Container max widths
 */
export const CONTAINER_MAX_WIDTH = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;
