import { Platform } from 'react-native';

/**
 * Animation manager for controlling concurrent animations
 * and optimizing performance on low-end devices
 */
class AnimationManager {
  private activeAnimations = new Set<string>();
  private maxConcurrentAnimations = 5;
  private isLowEndDevice = false;

  constructor() {
    // Detect low-end devices (simplified heuristic)
    this.isLowEndDevice = Platform.OS === 'android' && Platform.Version < 29;
    
    if (this.isLowEndDevice) {
      this.maxConcurrentAnimations = 3;
    }
  }

  /**
   * Check if we can start a new animation
   */
  canStartAnimation(): boolean {
    return this.activeAnimations.size < this.maxConcurrentAnimations;
  }

  /**
   * Register an animation as active
   */
  startAnimation(id: string): boolean {
    if (!this.canStartAnimation()) {
      return false;
    }

    this.activeAnimations.add(id);
    return true;
  }

  /**
   * Mark an animation as complete
   */
  endAnimation(id: string): void {
    this.activeAnimations.delete(id);
  }

  /**
   * Get animation config based on device performance
   */
  getAnimationConfig() {
    if (this.isLowEndDevice) {
      return {
        duration: 200, // Shorter duration
        useNativeDriver: true,
        skipFrames: true,
      };
    }

    return {
      duration: 300,
      useNativeDriver: true,
      skipFrames: false,
    };
  }

  /**
   * Get current active animation count
   */
  getActiveCount(): number {
    return this.activeAnimations.size;
  }

  /**
   * Check if device is low-end
   */
  isLowEnd(): boolean {
    return this.isLowEndDevice;
  }

  /**
   * Clear all active animations
   */
  clearAll(): void {
    this.activeAnimations.clear();
  }
}

export const animationManager = new AnimationManager();
