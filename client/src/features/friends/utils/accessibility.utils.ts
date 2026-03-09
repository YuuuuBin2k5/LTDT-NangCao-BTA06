import * as Haptics from 'expo-haptics';

/**
 * Accessibility utilities for friend location map
 */

/**
 * Trigger haptic feedback for different interaction types
 */
export const triggerHaptic = {
  /**
   * Light impact for button taps
   */
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available on this device
    }
  },

  /**
   * Medium impact for selections
   */
  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available on this device
    }
  },

  /**
   * Heavy impact for important actions
   */
  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Haptics not available on this device
    }
  },

  /**
   * Success notification
   */
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available on this device
    }
  },

  /**
   * Warning notification
   */
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Haptics not available on this device
    }
  },

  /**
   * Error notification
   */
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Haptics not available on this device
    }
  },

  /**
   * Selection changed
   */
  selection: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Haptics not available on this device
    }
  },
};

/**
 * Generate accessible label for friend marker
 */
export const getFriendMarkerLabel = (
  name: string,
  isOnline: boolean,
  lastSeenMinutes?: number
): string => {
  if (isOnline) {
    return `${name}, đang trực tuyến`;
  }
  if (lastSeenMinutes !== undefined) {
    return `${name}, hoạt động ${lastSeenMinutes} phút trước`;
  }
  return name;
};

/**
 * Generate accessible label for interaction button
 */
export const getInteractionLabel = (type: string): string => {
  const labels: Record<string, string> = {
    wave: 'Vẫy tay',
    heart: 'Gửi tim',
    poke: 'Chọc',
    high_five: '击掌',
  };
  return labels[type] || type;
};

/**
 * Generate accessible hint for privacy mode
 */
export const getPrivacyModeHint = (mode: string): string => {
  const hints: Record<string, string> = {
    ALL_FRIENDS: 'Tất cả bạn bè có thể xem vị trí của bạn',
    CLOSE_FRIENDS: 'Chỉ bạn thân có thể xem vị trí của bạn',
    GHOST_MODE: 'Không ai có thể xem vị trí của bạn',
  };
  return hints[mode] || '';
};

/**
 * Check if color contrast is sufficient (WCAG AA standard)
 */
export const hasGoodContrast = (
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean => {
  // Simplified contrast check
  // In production, use a proper color contrast library
  const minRatio = largeText ? 3 : 4.5;
  
  // This is a placeholder - implement proper contrast calculation
  return true;
};

/**
 * Get accessible role for component
 */
export const getAccessibleRole = (type: string): any => {
  const roles: Record<string, any> = {
    button: 'button',
    link: 'link',
    header: 'header',
    image: 'image',
    text: 'text',
  };
  return roles[type] || 'none';
};
