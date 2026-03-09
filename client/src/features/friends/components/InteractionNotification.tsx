import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Interaction, InteractionType } from '../../../shared/types/interaction.types';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';

interface InteractionNotificationProps {
  interaction: Interaction;
  onPress: () => void;
  onDismiss: () => void;
}

export const InteractionNotification: React.FC<InteractionNotificationProps> = ({
  interaction,
  onPress,
  onDismiss,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Slide in
    translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });

    // Auto dismiss after 4 seconds
    translateY.value = withDelay(
      4000,
      withTiming(-100, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      })
    );
    opacity.value = withDelay(4000, withTiming(0, { duration: 300 }));
  }, [interaction.id, translateY, opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getInteractionText = (type: InteractionType): string => {
    switch (type) {
      case InteractionType.HEART:
        return 'đã gửi tim cho bạn';
      case InteractionType.WAVE:
        return 'đã vẫy tay chào bạn';
      case InteractionType.POKE:
        return 'đã chọc bạn';
      case InteractionType.FIRE:
        return 'đã gửi lửa cho bạn';
      case InteractionType.STAR:
        return 'đã gửi sao cho bạn';
      case InteractionType.HUG:
        return 'đã ôm bạn';
      default:
        return 'đã tương tác với bạn';
    }
  };

  const getInteractionEmoji = (type: InteractionType): string => {
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

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={styles.notification}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <OptimizedImage
          uri={interaction.fromUserAvatar}
          style={styles.avatar}
        />
        
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {interaction.fromUserName}
          </Text>
          <Text style={styles.message} numberOfLines={1}>
            {getInteractionText(interaction.interactionType)}
          </Text>
        </View>

        <Text style={styles.emoji}>{getInteractionEmoji(interaction.interactionType)}</Text>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 2000,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#666',
  },
  emoji: {
    fontSize: 28,
    marginLeft: 8,
  },
  closeButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#666',
  },
});
