import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Place } from '../../../services/location/location.service';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';

interface PlaceCardProps {
  place: Place;
  onPress?: (place: Place) => void;
}

/**
 * PlaceCard component for displaying place information in a card format
 * Used for showing place preview when marker is tapped
 * Tapping the card navigates to the place details screen
 * Memoized to prevent unnecessary re-renders
 */
const PlaceCardComponent: React.FC<PlaceCardProps> = ({ place, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to place details screen
    router.push(`/place/${place.id}` as any);
    
    // Also call the optional onPress callback if provided
    if (onPress) {
      onPress(place);
    }
  };

  // Format rating display
  const formatRating = (rating: number): string => {
    if (rating === 0) return 'Chưa đánh giá';
    return `⭐ ${rating.toFixed(1)} / 5.0`;
  };

  // Format category display
  const formatCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      RESTAURANT: 'Nhà hàng',
      HOTEL: 'Khách sạn',
      PARK: 'Công viên',
      MUSEUM: 'Bảo tàng',
      SHOPPING: 'Mua sắm',
      ENTERTAINMENT: 'Giải trí',
      OTHER: 'Khác',
    };
    return categoryMap[category] || category;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Cover Image */}
      <View style={styles.imageContainer}>
        {place.coverImageUrl ? (
          <OptimizedImage 
            uri={place.coverImageUrl}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderEmoji}>🏪</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          <Text style={styles.rating}>{formatRating(place.averageRating)}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {place.description}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.category}>{formatCategory(place.category)}</Text>
          <Text style={styles.coordinates}>
            📍 {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 8,
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaeaea',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  coordinates: {
    fontSize: 11,
    color: '#999',
  },
});

/**
 * Memoized PlaceCard component
 * Only re-renders when place.id or onPress changes
 */
export const PlaceCard = memo(PlaceCardComponent, (prevProps, nextProps) => {
  // Only re-render if place id changes or onPress function changes
  return prevProps.place.id === nextProps.place.id && 
         prevProps.onPress === nextProps.onPress;
});
