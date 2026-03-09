import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Review } from '../../../services/location/location.service';
import { formatReviewTimestamp } from '../../../shared/utils/format.utils';

interface ReviewCardProps {
  review: Review;
}

/**
 * ReviewCard component for displaying review information
 * Shows author info, rating, content, visibility, and timestamp
 * Memoized to prevent unnecessary re-renders
 */
const ReviewCardComponent: React.FC<ReviewCardProps> = ({ review }) => {
  // Render star rating (★ for filled, ☆ for empty)
  const renderStars = (rating: number): string => {
    const filledStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return filledStars + emptyStars;
  };

  // Get visibility icon based on isPublic flag
  const getVisibilityIcon = (isPublic: boolean): string => {
    return isPublic ? '🌎' : '👥';
  };

  // Get default avatar placeholder
  const defaultAvatar = 'https://via.placeholder.com/40/cccccc/666666?text=?';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Author avatar with expo-image for better caching */}
        <Image
          source={{ uri: review.author.avatarUrl || defaultAvatar }}
          style={styles.avatar}
          placeholder={{ uri: defaultAvatar }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        
        <View style={styles.authorInfo}>
          {/* Author name */}
          <Text style={styles.authorName} numberOfLines={1}>
            {review.author.name}
          </Text>
          
          {/* Rating stars and visibility icon */}
          <View style={styles.metaRow}>
            <Text style={styles.stars}>{renderStars(review.rating)}</Text>
            <Text style={styles.visibilityIcon}>{getVisibilityIcon(review.isPublic)}</Text>
          </View>
        </View>
        
        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {formatReviewTimestamp(review.createdAt)}
        </Text>
      </View>
      
      {/* Review content */}
      <Text style={styles.content}>{review.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 14,
    color: '#FFB800',
    marginRight: 8,
  },
  visibilityIcon: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

/**
 * Memoized ReviewCard component
 * Only re-renders when review.id changes
 */
export const ReviewCard = memo(ReviewCardComponent, (prevProps, nextProps) => {
  // Only re-render if review id changes
  return prevProps.review.id === nextProps.review.id;
});
