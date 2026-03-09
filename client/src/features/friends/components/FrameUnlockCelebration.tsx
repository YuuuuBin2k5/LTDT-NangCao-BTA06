import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { AvatarFrame } from '../../../shared/types/avatar-frame.types';

interface FrameUnlockCelebrationProps {
  visible: boolean;
  frame: AvatarFrame | null;
  onComplete: () => void;
}

export const FrameUnlockCelebration: React.FC<FrameUnlockCelebrationProps> = ({
  visible,
  frame,
  onComplete,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);

  useEffect(() => {
    if (visible && frame) {
      // Reset values
      scale.value = 0;
      opacity.value = 0;
      confettiScale.value = 0;

      // Start animation sequence
      opacity.value = withTiming(1, { duration: 200 });
      
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );

      confettiScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.5, { damping: 6, stiffness: 80 }),
          withTiming(0, { duration: 500 }, (finished) => {
            if (finished) {
              runOnJS(onComplete)();
            }
          })
        )
      );
    }
  }, [visible, frame, scale, opacity, confettiScale, onComplete]);

  const frameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
    opacity: confettiScale.value,
  }));

  if (!frame) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onComplete}
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        <Animated.View style={[styles.confettiContainer, confettiAnimatedStyle]}>
          <Text style={styles.confetti}>🎉</Text>
          <Text style={[styles.confetti, styles.confetti2]}>✨</Text>
          <Text style={[styles.confetti, styles.confetti3]}>🎊</Text>
          <Text style={[styles.confetti, styles.confetti4]}>⭐</Text>
          <Text style={[styles.confetti, styles.confetti5]}>🌟</Text>
        </Animated.View>

        {/* Frame unlock card */}
        <Animated.View style={[styles.card, frameAnimatedStyle]}>
          <Text style={styles.title}>🎉 Mở khóa thành công!</Text>
          
          <View style={styles.framePreview}>
            <View style={styles.framePlaceholder}>
              <Text style={styles.frameIcon}>🖼️</Text>
            </View>
          </View>

          <Text style={styles.frameName}>{frame.name}</Text>
          
          {frame.description && (
            <Text style={styles.frameDescription}>{frame.description}</Text>
          )}

          {frame.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>⭐ Premium</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    fontSize: 40,
  },
  confetti2: {
    top: '20%',
    left: '20%',
  },
  confetti3: {
    top: '30%',
    right: '20%',
  },
  confetti4: {
    bottom: '30%',
    left: '30%',
  },
  confetti5: {
    bottom: '20%',
    right: '30%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  framePreview: {
    marginBottom: 20,
  },
  framePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  frameIcon: {
    fontSize: 60,
  },
  frameName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  frameDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
