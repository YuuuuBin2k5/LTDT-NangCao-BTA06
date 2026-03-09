import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import { ActiveEffect, InteractionType } from '../../../shared/types/interaction.types';
import { InteractionAnimation } from './InteractionAnimations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface InteractionEffectOverlayProps {
  effects: ActiveEffect[];
  onEffectComplete: (effectId: string) => void;
  mapRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

/**
 * InteractionEffectOverlay - Canvas layer over map for interaction animations
 * Manages active effect animations and handles effect lifecycle
 * Requirements: 4.2, 4.6
 */
export const InteractionEffectOverlay: React.FC<InteractionEffectOverlayProps> = ({
  effects,
  onEffectComplete,
  mapRegion,
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {effects.map((effect) => (
        <InteractionEffect
          key={effect.id}
          effect={effect}
          onComplete={() => onEffectComplete(effect.id)}
          mapRegion={mapRegion}
        />
      ))}
    </View>
  );
};

interface InteractionEffectProps {
  effect: ActiveEffect;
  onComplete: () => void;
  mapRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

/**
 * InteractionEffect - Individual effect animation component
 * Handles the lifecycle of a single interaction effect from start to completion
 */
const InteractionEffect: React.FC<InteractionEffectProps> = ({ 
  effect, 
  onComplete,
  mapRegion 
}) => {
  const progress = useSharedValue(0);
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    // Generate particles for trail effect (5 particles with staggered timing)
    setParticles(Array.from({ length: 5 }, (_, i) => i));

    // Start animation with smooth bezier easing
    progress.value = withTiming(
      1,
      {
        duration: 1500, // 1.5 seconds for smooth animation
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease-in-out
      },
      (finished) => {
        if (finished) {
          // Call completion callback on JS thread
          runOnUI(() => {
            'worklet';
            onComplete();
          })();
        }
      }
    );
  }, [effect.id, progress, onComplete]);

  /**
   * Calculate position along Bezier curve
   * Implements smooth trajectory with natural arc
   * Requirements: 4.6
   */
  const getPositionAtProgress = (t: number) => {
    const { fromCoordinate, toCoordinate } = effect;
    
    // Calculate control point for quadratic Bezier curve
    // Creates a natural arc by offsetting the midpoint perpendicular to the line
    const midX = (fromCoordinate.longitude + toCoordinate.longitude) / 2;
    const midY = (fromCoordinate.latitude + toCoordinate.latitude) / 2;
    
    // Add arc height (30% of distance for natural curve)
    const distance = Math.sqrt(
      Math.pow(toCoordinate.latitude - fromCoordinate.latitude, 2) +
      Math.pow(toCoordinate.longitude - fromCoordinate.longitude, 2)
    );
    const arcHeight = distance * 0.3;
    
    // Control point creates the arc
    const controlX = midX;
    const controlY = midY + arcHeight;

    // Quadratic Bezier curve formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const x =
      Math.pow(1 - t, 2) * fromCoordinate.longitude +
      2 * (1 - t) * t * controlX +
      Math.pow(t, 2) * toCoordinate.longitude;

    const y =
      Math.pow(1 - t, 2) * fromCoordinate.latitude +
      2 * (1 - t) * t * controlY +
      Math.pow(t, 2) * toCoordinate.latitude;

    return { x, y };
  };

  /**
   * Convert lat/lng coordinates to screen coordinates
   * Uses map region to calculate proper positioning
   */
  const latLngToScreen = (lat: number, lng: number) => {
    if (!mapRegion) {
      // Fallback to simple conversion if no map region
      const screenX = ((lng + 180) / 360) * SCREEN_WIDTH;
      const screenY = ((90 - lat) / 180) * SCREEN_HEIGHT;
      return { x: screenX, y: screenY };
    }

    // Calculate position relative to map region
    const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;
    
    const x = ((lng - (longitude - longitudeDelta / 2)) / longitudeDelta) * SCREEN_WIDTH;
    const y = (((latitude + latitudeDelta / 2) - lat) / latitudeDelta) * SCREEN_HEIGHT;
    
    return { x, y };
  };

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const pos = getPositionAtProgress(t);
    const screen = latLngToScreen(pos.y, pos.x);

    return {
      transform: [
        { translateX: screen.x },
        { translateY: screen.y },
        { scale: withTiming(1 - t * 0.2) }, // Slight shrink as it travels
      ],
      opacity: withTiming(1 - t * 0.5), // Fade out gradually
    };
  });

  /**
   * Get emoji representation for each interaction type
   * Requirements: 4.1, 4.2
   */
  const getEffectEmoji = (type: InteractionType): string => {
    switch (type) {
      case InteractionType.HEART:
        return '❤️';
      case InteractionType.WAVE:
        return '👋';
      case InteractionType.POKE:
        return '👉';
      case InteractionType.FIRE:
        return '🔥';
      case InteractionType.STAR:
        return '⭐';
      case InteractionType.HUG:
        return '🤗';
      default:
        return '✨';
    }
  };

  /**
   * Get particle color based on interaction type
   */
  const getParticleColor = (type: InteractionType): string => {
    switch (type) {
      case InteractionType.HEART:
        return '#FF69B4'; // Hot pink
      case InteractionType.WAVE:
        return '#4FC3F7'; // Light blue
      case InteractionType.POKE:
        return '#FFD54F'; // Amber
      case InteractionType.FIRE:
        return '#FF5722'; // Deep orange
      case InteractionType.STAR:
        return '#FFC107'; // Gold
      case InteractionType.HUG:
        return '#9C27B0'; // Purple
      default:
        return '#FF69B4';
    }
  };

  // Explosion effect at destination
  const explosionScale = useSharedValue(0);
  const explosionOpacity = useSharedValue(0);

  useEffect(() => {
    // Trigger explosion when animation reaches 90%
    const explosionTimer = setTimeout(() => {
      explosionScale.value = withSequence(
        withTiming(1.5, { duration: 200 }),
        withTiming(0, { duration: 300 })
      );
      explosionOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 })
      );
    }, 1350); // 90% of 1500ms

    return () => clearTimeout(explosionTimer);
  }, [effect.id, explosionScale, explosionOpacity]);

  const explosionStyle = useAnimatedStyle(() => {
    const pos = getPositionAtProgress(1); // Destination position
    const screen = latLngToScreen(pos.y, pos.x);

    return {
      transform: [
        { translateX: screen.x },
        { translateY: screen.y },
        { scale: explosionScale.value },
      ],
      opacity: explosionOpacity.value,
    };
  });

  return (
    <>
      {/* Main effect with specialized animation - Requirements: 4.1, 4.2 */}
      <Animated.View style={[styles.effectContainer, animatedStyle]}>
        <InteractionAnimation 
          type={effect.type} 
          progress={progress.value} 
          size={40} 
        />
      </Animated.View>

      {/* Particle trail - Requirements: 4.2, 4.3 */}
      {particles.map((index) => (
        <ParticleEffect
          key={`${effect.id}-particle-${index}`}
          effect={effect}
          delay={index * 100}
          getPositionAtProgress={getPositionAtProgress}
          latLngToScreen={latLngToScreen}
          color={getParticleColor(effect.type)}
        />
      ))}

      {/* Explosion effect at arrival - Requirements: 4.2, 4.3 */}
      <Animated.View style={[styles.explosion, explosionStyle]}>
        <View style={[styles.explosionRing, { borderColor: getParticleColor(effect.type) }]} />
        <View style={[styles.explosionCenter, { backgroundColor: getParticleColor(effect.type) }]} />
      </Animated.View>
    </>
  );
};

interface ParticleEffectProps {
  effect: ActiveEffect;
  delay: number;
  getPositionAtProgress: (t: number) => { x: number; y: number };
  latLngToScreen: (lat: number, lng: number) => { x: number; y: number };
  color: string;
}

/**
 * ParticleEffect - Individual particle in the trail
 * Creates particle system for trails with glow effects
 * Requirements: 4.2, 4.3
 */
const ParticleEffect: React.FC<ParticleEffectProps> = ({
  effect,
  delay,
  getPositionAtProgress,
  latLngToScreen,
  color,
}) => {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Stagger particle animation with delay
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 1500 - delay,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    // Particle scale animation (pop in, then fade)
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0.3, { duration: 1350 - delay })
      )
    );
  }, [delay, progress, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const pos = getPositionAtProgress(t);
    const screen = latLngToScreen(pos.y, pos.x);

    return {
      transform: [
        { translateX: screen.x },
        { translateY: screen.y },
        { scale: scale.value },
      ],
      opacity: (1 - t) * 0.8, // Fade out as it travels
    };
  });

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <View style={[styles.particleDot, { backgroundColor: color }]} />
      {/* Glow effect - Requirements: 4.2, 4.3 */}
      <View style={[styles.particleGlow, { backgroundColor: color }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none', // Allow touches to pass through to map
  },
  effectContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effect: {
    position: 'absolute',
    fontSize: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  particle: {
    position: 'absolute',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  particleGlow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.3,
    position: 'absolute',
  },
  explosion: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explosionRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  explosionCenter: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
