import React, { useRef, useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import RNMapView, { Region, Marker } from 'react-native-maps';
import { FriendLocation } from '../../../shared/types/location.types';
import { FriendMarker } from './FriendMarker';
import { useFriendLocations } from '../hooks/useFriendLocations';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';
import { useAuth } from '../../../store/contexts/AuthContext';

interface FriendLocationMapViewProps {
  initialRegion?: Region;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  onFriendPress: (friend: FriendLocation) => void;
  onOwnMarkerPress?: () => void;
  currentStatus?: {
    message: string;
    emoji: string;
  };
}

export const FriendLocationMapView: React.FC<FriendLocationMapViewProps> = ({
  initialRegion,
  currentLocation,
  onFriendPress,
  onOwnMarkerPress,
  currentStatus,
}) => {
  const mapRef = useRef<RNMapView>(null);
  const { friendLocations, isLoading, error, refresh } = useFriendLocations();
  const { user } = useAuth();

  /**
   * Center map on user's current location
   */
  const centerOnMyLocation = useCallback(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500
      );
    }
  }, [currentLocation]);

  /**
   * Center map on a specific friend
   */
  const centerOnFriend = useCallback((friend: FriendLocation) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: friend.latitude,
          longitude: friend.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  }, []);

  /**
   * Fit map to show all friends
   */
  const fitToFriends = useCallback(() => {
    if (friendLocations.length > 0 && mapRef.current) {
      const coordinates = friendLocations.map((friend) => ({
        latitude: friend.latitude,
        longitude: friend.longitude,
      }));

      // Add current location if available
      if (currentLocation) {
        coordinates.push(currentLocation);
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  }, [friendLocations, currentLocation]);

  const handleFriendPress = useCallback(
    (friend: FriendLocation) => {
      centerOnFriend(friend);
      onFriendPress(friend);
    },
    [centerOnFriend, onFriendPress]
  );

  if (!initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>📍 Đang lấy vị trí của bạn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        followsUserLocation={false}
      >
        {/* Render own marker with status */}
        {currentLocation && user && (
          <Marker
            coordinate={currentLocation}
            onPress={onOwnMarkerPress}
            tracksViewChanges={false}
          >
            <View style={styles.ownMarkerContainer}>
              <View style={styles.ownAvatarContainer}>
                <OptimizedImage
                  uri={user.avatarUrl || 'https://via.placeholder.com/50'}
                  style={styles.ownAvatar}
                />
                <View style={styles.ownOnlineIndicator} />
              </View>
              
              {/* Status bubble */}
              {currentStatus?.message && (
                <View style={styles.ownStatusBubble}>
                  {currentStatus.emoji && (
                    <Text style={styles.ownStatusEmoji}>{currentStatus.emoji}</Text>
                  )}
                  <Text style={styles.ownStatusText} numberOfLines={1}>
                    {currentStatus.message}
                  </Text>
                </View>
              )}
            </View>
          </Marker>
        )}

        {/* Render friend markers */}
        {friendLocations.map((friend) => (
          <FriendMarker
            key={friend.userId}
            friend={friend}
            onPress={handleFriendPress}
            animationEnabled={true}
          />
        ))}
      </RNMapView>

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={centerOnMyLocation}
        activeOpacity={0.7}
      >
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>

      {/* Fit All Friends Button */}
      {friendLocations.length > 0 && (
        <TouchableOpacity
          style={styles.fitAllButton}
          onPress={fitToFriends}
          activeOpacity={0.7}
        >
          <Text style={styles.fitAllIcon}>👥</Text>
        </TouchableOpacity>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Không thể tải vị trí bạn bè
          </Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading indicator */}
      {isLoading && friendLocations.length === 0 && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Đang tải vị trí bạn bè...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  ownMarkerContainer: {
    alignItems: 'center',
  },
  ownAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#2196F3',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ownAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  ownOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  ownStatusBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    maxWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  ownStatusEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  ownStatusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  myLocationIcon: {
    fontSize: 24,
  },
  fitAllButton: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fitAllIcon: {
    fontSize: 24,
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
