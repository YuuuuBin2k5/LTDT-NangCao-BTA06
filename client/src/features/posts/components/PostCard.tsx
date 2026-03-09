/**
 * Post card component for displaying posts in feed/carousel
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';
import type { Post } from '../types/post.types';

interface PostCardProps {
  post: Post;
  onPress: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const router = useRouter();
  const firstImage = post.images[0];
  const hasMultipleImages = post.images.length > 1;

  // Format time ago
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleHashtagPress = (hashtag: string) => {
    router.push(`/hashtag/${hashtag}` as any);
  };

  const renderContentWithHashtags = () => {
    const parts = post.content.split(/(#\w+)/g);
    
    return (
      <Text style={styles.postContent} numberOfLines={3}>
        {parts.map((part, index) => {
          if (part.startsWith('#')) {
            const hashtag = part.substring(1);
            return (
              <Text
                key={index}
                style={styles.hashtag}
                onPress={(e) => {
                  e.stopPropagation();
                  handleHashtagPress(hashtag);
                }}
              >
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(post)}
      activeOpacity={0.9}
    >
      {/* Image */}
      {firstImage && (
        <View style={styles.imageContainer}>
          <OptimizedImage 
            uri={firstImage.imageUrl}
            style={styles.image}
            contentFit="cover"
          />
          {hasMultipleImages && (
            <View style={styles.multipleImagesBadge}>
              <Text style={styles.multipleImagesText}>+{post.images.length - 1}</Text>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* User info */}
        <View style={styles.userInfo}>
          {post.user.avatarUrl && (
            <OptimizedImage 
              uri={post.user.avatarUrl}
              style={styles.avatar}
              contentFit="cover"
            />
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.user.nickName}</Text>
            <Text style={styles.timeAgo}>{getTimeAgo(post.createdAt)}</Text>
          </View>
        </View>

        {/* Post content */}
        {renderContentWithHashtags()}

        {/* Location */}
        {post.locationName && (
          <Text style={styles.location} numberOfLines={1}>
            📍 {post.locationName}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <Text style={styles.statText}>❤️ {post.likeCount}</Text>
          <Text style={styles.statText}>💬 {post.commentCount}</Text>
          <Text style={styles.statText}>👁️ {post.viewCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  multipleImagesBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  multipleImagesText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    overflow: 'hidden',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  hashtag: {
    color: '#007AFF',
    fontWeight: '600',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
});
