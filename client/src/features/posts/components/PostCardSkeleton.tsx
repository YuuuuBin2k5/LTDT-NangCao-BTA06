/**
 * PostCardSkeleton - Loading skeleton for PostCard
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const PostCardSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />

      {/* Content skeleton */}
      <View style={styles.content}>
        {/* User info skeleton */}
        <View style={styles.userInfo}>
          <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
          <View style={styles.userDetails}>
            <Animated.View style={[styles.userNameSkeleton, { opacity }]} />
            <Animated.View style={[styles.timeAgoSkeleton, { opacity }]} />
          </View>
        </View>

        {/* Content lines skeleton */}
        <Animated.View style={[styles.contentLine, { opacity }]} />
        <Animated.View style={[styles.contentLine, styles.contentLineShort, { opacity }]} />

        {/* Stats skeleton */}
        <View style={styles.stats}>
          <Animated.View style={[styles.statSkeleton, { opacity }]} />
          <Animated.View style={[styles.statSkeleton, { opacity }]} />
          <Animated.View style={[styles.statSkeleton, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageSkeleton: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  userDetails: {
    flex: 1,
  },
  userNameSkeleton: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginBottom: 4,
  },
  timeAgoSkeleton: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  contentLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  contentLineShort: {
    width: '70%',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  statSkeleton: {
    width: 40,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
});
