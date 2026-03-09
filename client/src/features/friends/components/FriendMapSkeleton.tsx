import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const FriendMapSkeleton: React.FC = () => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Map skeleton */}
      <Animated.View style={[styles.mapSkeleton, { opacity }]} />

      {/* Marker skeletons */}
      <Animated.View style={[styles.markerSkeleton, styles.marker1, { opacity }]} />
      <Animated.View style={[styles.markerSkeleton, styles.marker2, { opacity }]} />
      <Animated.View style={[styles.markerSkeleton, styles.marker3, { opacity }]} />

      {/* Bottom sheet skeleton */}
      <View style={styles.bottomSheet}>
        <Animated.View style={[styles.handle, { opacity }]} />
        <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
        <Animated.View style={[styles.textSkeleton, styles.nameSkeleton, { opacity }]} />
        <Animated.View style={[styles.textSkeleton, styles.statusSkeleton, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mapSkeleton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  markerSkeleton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D0D0D0',
  },
  marker1: {
    top: '30%',
    left: '40%',
  },
  marker2: {
    top: '50%',
    right: '30%',
  },
  marker3: {
    bottom: '40%',
    left: '60%',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: 200,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatarSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  textSkeleton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  nameSkeleton: {
    width: '60%',
    height: 20,
  },
  statusSkeleton: {
    width: '40%',
    height: 16,
  },
});
