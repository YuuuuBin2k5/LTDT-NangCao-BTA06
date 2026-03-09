import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { InteractionType } from '../../../shared/types/interaction.types';

interface InteractionAnimationProps {
  type: InteractionType;
  progress: number;
  size?: number;
}

/**
 * Specialized animation components for each interaction type
 * Requirements: 4.1, 4.2
 */

/**
 * Heart animation - Red heart with particle trail
 */
export const HeartAnimation: React.FC<{ progress: number; size: number }> = ({ 
  progress, 
  size 
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withTiming(1, { duration: 100 })
    );
    rotation.value = withRepeat(
      withTiming(10, { duration: 300 }),
      -1,
      true
    );
  }, [scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * (1 - progress * 0.2) },
      { rotate: `${rotation.value * (1 - progress)}deg` },
    ],
    opacity: 1 - progress * 0.5,
  }));

  return (
    <Animated.Text style={[styles.emoji, { fontSize: size }, animatedStyle]}>
      ❤️
    </Animated.Text>
  );
};

/**
 * Wave animation - Hand wave with motion blur effect
 */
export const WaveAnimation: React.FC<{ progress: number; size: number }> = ({ 
  progress, 
  size 
}) => {
  const rotation = useSharedValue(-20);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 200 }),
        withTiming(-20, { duration: 200 })
      ),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value * (1 - progress)}deg` },
      { scale: 1 - progress * 0.2 },
    ],
    opacity: 1 - progress * 0.5,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Animated.Text style={[styles.emoji, { fontSize: size }]}>
        👋
      </Animated.Text>
    </Animated.View>
  );
};

/**
 * Poke animation - Finger poke with ripple effect
 */
export const PokeAnimation: React.FC<{ progress: number; size: number }> = ({ 
  progress, 
  size 
}) => {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    rippleScale.value = withRepeat(
      withTiming(2, { duration: 600 }),
      -1,
      false
    );
    rippleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      false
    );
  }, [rippleScale, rippleOpacity]);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - progress * 0.2 }],
    opacity: 1 - progress * 0.5,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value * (1 - progress) }],
    opacity: rippleOpacity.value * (1 - progress),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ripple, rippleStyle]} />
      <Animated.Text style={[styles.emoji, { fontSize: size }, emojiStyle]}>
        👉
      </Animated.Text>
    </View>
  );
};

/**
 * Fire animation - Flame with ember particles
 */
export const FireAnimation: React.FC<{ progress: number; size: number }> = ({ 
  progress, 
  size 
}) => {
  const flicker = useSharedValue(1);
  const emberY = useSharedValue(0);

  useEffect(() => {
    flicker.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(0.9, { duration: 100 }),
        withTiming(1, { duration: 100 })
      ),
      -1,
      false
    );

    emberY.value = withRepeat(
      withTiming(-20, { duration: 800, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
  }, [flicker, emberY]);

  const fireStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flicker.value * (1 - progress * 0.2) },
    ],
    opacity: 1 - progress * 0.5,
  }));

  const emberStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: emberY.value * (1 - progress) },
    ],
    opacity: (1 - emberY.value / -20) * (1 - progress),
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.emoji, { fontSize: size }, fireStyle]}>
        🔥
      </Animated.Text>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.ember,
            emberStyle,
            { left: -5 + i * 5, top: size / 2 },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * Star animation - Shooting star with sparkles
 */
export const StarAnimation: React.FC<{ progress: number; size: number }> = ({ 
  progress, 
  size 
}) => {
  const rotation = useSharedValue(0);
  const sparkleScale = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(360, {
      duration: 1500,
      easing: Easing.linear,
    });

    sparkleScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 200 })
      ),
      -1,
      false
    );
  }, [rotation, sparkleScale]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value * (1 - progress)}deg` },
      { scale: 1 - progress * 0.2 },
    ],
    opacity: 1 - progress * 0.5,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value * (1 - progress) }],
    opacity: sparkleScale.value * (1 - progress),
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.emoji, { fontSize: size }, starStyle]}>
        ⭐
      </Animated.Text>
      {[0, 1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.sparkle,
            sparkleStyle,
            {
              left: Math.cos((i * Math.PI) / 2) * size * 0.6,
              top: Math.sin((i * Math.PI) / 2) * size * 0.6,
            },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * Hug animation - Two arms with warm glow
 */
export const HugAnimation: React.FC<{ progress: number; size: number }> = ({ 
  progress, 
  size 
}) => {
  const leftArmRotation = useSharedValue(-30);
  const rightArmRotation = useSharedValue(30);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    // Arms closing animation
    leftArmRotation.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(-30, { duration: 400 })
      ),
      -1,
      false
    );

    rightArmRotation.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(30, { duration: 400 })
      ),
      -1,
      false
    );

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      false
    );
  }, [leftArmRotation, rightArmRotation, glowScale]);

  const hugStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - progress * 0.2 }],
    opacity: 1 - progress * 0.5,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value * (1 - progress) }],
    opacity: 0.3 * (1 - progress),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.Text style={[styles.emoji, { fontSize: size }, hugStyle]}>
        🤗
      </Animated.Text>
    </View>
  );
};

/**
 * Main component that renders the appropriate animation based on type
 */
export const InteractionAnimation: React.FC<InteractionAnimationProps> = ({
  type,
  progress,
  size = 40,
}) => {
  switch (type) {
    case InteractionType.HEART:
      return <HeartAnimation progress={progress} size={size} />;
    case InteractionType.WAVE:
      return <WaveAnimation progress={progress} size={size} />;
    case InteractionType.POKE:
      return <PokeAnimation progress={progress} size={size} />;
    case InteractionType.FIRE:
      return <FireAnimation progress={progress} size={size} />;
    case InteractionType.STAR:
      return <StarAnimation progress={progress} size={size} />;
    case InteractionType.HUG:
      return <HugAnimation progress={progress} size={size} />;
    default:
      return (
        <Animated.Text style={[styles.emoji, { fontSize: size }]}>
          ✨
        </Animated.Text>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  ember: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF5722',
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFC107',
  },
  glow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9C27B0',
  },
});
