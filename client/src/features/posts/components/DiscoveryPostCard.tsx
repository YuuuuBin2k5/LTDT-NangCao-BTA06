/**
 * Post card for discovery feed with "Not Interested" button
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PostCard } from './PostCard';
import { NotInterestedButton } from './NotInterestedButton';
import { RecommendationBadge } from './RecommendationBadge';
import type { Post } from '../types/post.types';

interface DiscoveryPostCardProps {
  post: Post;
  onPress: (post: Post) => void;
  onFeedbackSubmitted?: (postId: number) => void;
}

export const DiscoveryPostCard: React.FC<DiscoveryPostCardProps> = ({
  post,
  onPress,
  onFeedbackSubmitted,
}) => {
  return (
    <View style={styles.container}>
      <RecommendationBadge postId={post.id} isRecommended={true} />
      <PostCard post={post} onPress={onPress} />
      <View style={styles.feedbackContainer}>
        <NotInterestedButton
          postId={post.id}
          onFeedbackSubmitted={() => onFeedbackSubmitted?.(post.id)}
          compact
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  feedbackContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
});
