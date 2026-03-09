import React, { memo } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Place } from '../../../services/location/location.service';

interface PlaceMarkerProps {
  place: Place;
  onPress?: (place: Place) => void;
}

/**
 * PlaceMarker component for displaying a place on the map
 * Shows a marker with the place name and rating
 * Tapping the marker shows a callout with place details
 * Tapping the callout navigates to the place details screen
 * Memoized to prevent unnecessary re-renders
 */
const PlaceMarkerComponent: React.FC<PlaceMarkerProps> = ({ place, onPress }) => {
  const router = useRouter();

  const handleMarkerPress = () => {
    if (onPress) {
      onPress(place);
    }
  };

  const handleCalloutPress = () => {
    // Navigate to place details screen
    router.push(`/place/${place.id}` as any);
  };

  // Get marker color based on category
  const getMarkerColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      RESTAURANT: '#FF6B6B',
      HOTEL: '#4ECDC4',
      PARK: '#95E1D3',
      MUSEUM: '#F38181',
      SHOPPING: '#AA96DA',
      ENTERTAINMENT: '#FCBAD3',
      OTHER: '#A8DADC',
    };
    return colorMap[category] || '#A8DADC';
  };

  // Format rating display
  const formatRating = (rating: number): string => {
    return rating > 0 ? `⭐ ${rating.toFixed(1)}` : 'Chưa đánh giá';
  };

  return (
    <Marker
      coordinate={{
        latitude: place.latitude,
        longitude: place.longitude,
      }}
      pinColor={getMarkerColor(place.category)}
      onPress={handleMarkerPress}
      identifier={`place-${place.id}`}
    >
      <Callout onPress={handleCalloutPress}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{place.name}</Text>
          <Text style={styles.calloutRating}>{formatRating(place.averageRating)}</Text>
          <Text style={styles.calloutDescription} numberOfLines={2}>
            {place.description}
          </Text>
          <Text style={styles.calloutCategory}>{place.category}</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutCategory: {
    fontSize: 11,
    color: '#999',
    textTransform: 'capitalize',
  },
});

/**
 * Memoized PlaceMarker component
 * Only re-renders when place.id changes
 */
export const PlaceMarker = memo(PlaceMarkerComponent, (prevProps, nextProps) => {
  return prevProps.place.id === nextProps.place.id &&
         prevProps.onPress === nextProps.onPress;
});
