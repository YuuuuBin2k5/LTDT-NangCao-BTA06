/**
 * Animated like button component
 */
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onToggle: () => Promise<void>;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  likeCount,
  onToggle,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handlePress = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await onToggle();
    setIsAnimating(false);
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={isAnimating}
    >
      <Animated.Text
        style={[
          styles.icon,
          { transform: [{ scale: scaleAnim }] },
          isLiked && styles.iconLiked,
        ]}
      >
        {isLiked ? '❤️' : '🤍'}
      </Animated.Text>
      <Text style={styles.count}>{likeCount}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 20,
  },
  iconLiked: {
    // Already colored by emoji
  },
  count: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});
