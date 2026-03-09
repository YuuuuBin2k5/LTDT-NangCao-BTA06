import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import RNMapView, { Marker, Region } from 'react-native-maps';
import { MapRegion, MapMarker } from '../types';
import { Place } from '../../../services/location/location.service';
import { PlaceMarker } from './PlaceMarker';
import { ClusterMarker } from './ClusterMarker';
import { clusterPlaces, shouldCluster, PlaceCluster, clusterPosts, PostCluster } from '../utils/clustering';
import type { Post } from '../../posts/types/post.types';
import { PostMarker } from '../../posts/components/PostMarker';
import { PostClusterMarker } from '../../posts/components/PostClusterMarker';
import type { FriendLocation } from '../../../shared/types/location.types';
import { FriendMarker } from '../../friends/components/FriendMarker';
import type { Mission } from '../../missions/types/mission.types';
import { MissionMarker } from '../../missions/components/MissionMarker';

interface MapViewProps {
  initialRegion?: MapRegion;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  currentUser?: FriendLocation;
  markers?: MapMarker[];
  places?: Place[];
  posts?: Post[];
  friendLocations?: FriendLocation[];
  showFriends?: boolean;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  followsUserLocation?: boolean;
  missions?: Mission[];
  onPlacePress?: (place: Place) => void;
  onClusterPress?: (cluster: PlaceCluster) => void;
  onPostPress?: (post: Post) => void;
  onPostClusterPress?: (cluster: PostCluster) => void;
  onFriendPress?: (friend: FriendLocation) => void;
  onMissionPress?: (mission: Mission) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  initialRegion,
  currentLocation,
  currentUser,
  markers = [],
  places = [],
  posts = [],
  friendLocations = [],
  showFriends = false,
  showsUserLocation = true,
  showsMyLocationButton = true,
  followsUserLocation = true,
  missions = [],
  onPlacePress,
  onClusterPress,
  onPostPress,
  onPostClusterPress,
  onFriendPress,
  onMissionPress,
}) => {
  const [currentRegion, setCurrentRegion] = useState<MapRegion | undefined>(
    initialRegion
  );
  const mapRef = React.useRef<RNMapView>(null);

  console.log('🗺️ [MapView] Render:', {
    showFriends,
    friendCount: friendLocations.length,
    hasCurrentUser: !!currentUser,
    currentUserLocation: currentUser ? { lat: currentUser.latitude, lng: currentUser.longitude } : null,
  });

  // Handle region change to update clustering
  const handleRegionChangeComplete = useCallback((region: Region) => {
    setCurrentRegion({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });
  }, []);

  /**
   * Filter places to only show those within the current viewport
   * This improves performance by not rendering markers outside the visible area
   */
  const visiblePlaces = useMemo(() => {
    if (!currentRegion || places.length === 0) {
      return places;
    }

    // Calculate viewport bounds with some padding for smooth transitions
    const padding = 0.2; // 20% padding
    const latPadding = currentRegion.latitudeDelta * padding;
    const lngPadding = currentRegion.longitudeDelta * padding;

    const minLat = currentRegion.latitude - currentRegion.latitudeDelta / 2 - latPadding;
    const maxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2 + latPadding;
    const minLng = currentRegion.longitude - currentRegion.longitudeDelta / 2 - lngPadding;
    const maxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2 + lngPadding;

    // Filter places within viewport bounds
    return places.filter(place => 
      place.latitude >= minLat &&
      place.latitude <= maxLat &&
      place.longitude >= minLng &&
      place.longitude <= maxLng
    );
  }, [places, currentRegion]);

  /**
   * Filter posts to only show those within the current viewport
   */
  const visiblePosts = useMemo(() => {
    if (!currentRegion || posts.length === 0) {
      return posts;
    }

    const padding = 0.2;
    const latPadding = currentRegion.latitudeDelta * padding;
    const lngPadding = currentRegion.longitudeDelta * padding;

    const minLat = currentRegion.latitude - currentRegion.latitudeDelta / 2 - latPadding;
    const maxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2 + latPadding;
    const minLng = currentRegion.longitude - currentRegion.longitudeDelta / 2 - lngPadding;
    const maxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2 + lngPadding;

    return posts.filter(post => 
      post.latitude >= minLat &&
      post.latitude <= maxLat &&
      post.longitude >= minLng &&
      post.longitude <= maxLng
    );
  }, [posts, currentRegion]);

  /**
   * Filter friend locations to only show those within the current viewport
   * TEMPORARILY DISABLED - Show all friends to debug viewport issue
   */
  const visibleFriends = useMemo(() => {
    console.log('🗺️ [MapView] visibleFriends calculation:', {
      totalFriends: friendLocations.length,
      showFriends,
      hasRegion: !!currentRegion,
      friendLocations: friendLocations.map(f => ({
        userId: f.userId,
        name: f.name,
        lat: f.latitude,
        lng: f.longitude,
      })),
    });

    // TEMPORARILY: Return all friends without filtering to debug
    console.log('🗺️ [MapView] Returning ALL friends (viewport filtering disabled):', friendLocations.length);
    return friendLocations;

    /* ORIGINAL FILTERING CODE - Re-enable after debugging
    if (!currentRegion || friendLocations.length === 0) {
      console.log('🗺️ [MapView] Returning all friends (no region or empty):', friendLocations.length);
      return friendLocations;
    }

    const padding = 0.2;
    const latPadding = currentRegion.latitudeDelta * padding;
    const lngPadding = currentRegion.longitudeDelta * padding;

    const minLat = currentRegion.latitude - currentRegion.latitudeDelta / 2 - latPadding;
    const maxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2 + latPadding;
    const minLng = currentRegion.longitude - currentRegion.longitudeDelta / 2 - lngPadding;
    const maxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2 + lngPadding;

    const filtered = friendLocations.filter(friend => 
      friend.latitude >= minLat &&
      friend.latitude <= maxLat &&
      friend.longitude >= minLng &&
      friend.longitude <= maxLng
    );

    console.log('🗺️ [MapView] Filtered friends:', {
      total: friendLocations.length,
      visible: filtered.length,
      region: { minLat, maxLat, minLng, maxLng },
    });

    return filtered;
    */
  }, [friendLocations, currentRegion, showFriends]);

  /**
   * Filter missions to only show those within the current viewport
   */
  const visibleMissions = useMemo(() => {
    if (!currentRegion || missions.length === 0) {
      return missions;
    }

    const padding = 0.2;
    const latPadding = currentRegion.latitudeDelta * padding;
    const lngPadding = currentRegion.longitudeDelta * padding;

    const minLat = currentRegion.latitude - currentRegion.latitudeDelta / 2 - latPadding;
    const maxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2 + latPadding;
    const minLng = currentRegion.longitude - currentRegion.longitudeDelta / 2 - lngPadding;
    const maxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2 + lngPadding;

    return missions.filter(mission => 
      mission.latitude >= minLat &&
      mission.latitude <= maxLat &&
      mission.longitude >= minLng &&
      mission.longitude <= maxLng
    );
  }, [missions, currentRegion]);

  if (!initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>📍 Đang lấy vị trí của bạn...</Text>
      </View>
    );
  }

  // Determine if we should cluster places and posts
  const regionForClustering = currentRegion || initialRegion;
  const usePlaceClustering = shouldCluster(visiblePlaces.length, regionForClustering);
  const usePostClustering = shouldCluster(visiblePosts.length, regionForClustering);

  // Generate clusters if needed - memoized to prevent recalculation
  const placeClusters = useMemo(() => {
    return usePlaceClustering
      ? clusterPlaces(visiblePlaces, regionForClustering)
      : [];
  }, [usePlaceClustering, visiblePlaces, regionForClustering]);

  const postClusters = useMemo(() => {
    return usePostClustering
      ? clusterPosts(visiblePosts, regionForClustering)
      : [];
  }, [usePostClustering, visiblePosts, regionForClustering]);

  return (
    <RNMapView
      ref={mapRef}
      key={`map-${showFriends ? 'friends' : 'posts'}-${friendLocations.length}`}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={showsMyLocationButton}
      followsUserLocation={followsUserLocation}
      onRegionChangeComplete={handleRegionChangeComplete}
    >
      {currentLocation && (
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="Vị trí của bạn"
          description="Bạn đang ở đây"
        />
      )}
      
      {/* Render generic markers */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
        />
      ))}

      {/* Render place markers or clusters */}
      {usePlaceClustering ? (
        // Render clusters
        placeClusters.map((cluster) =>
          cluster.count === 1 ? (
            // Single place - render as regular marker
            <PlaceMarker
              key={`place-${cluster.places[0].id}`}
              place={cluster.places[0]}
              onPress={onPlacePress}
            />
          ) : (
            // Multiple places - render as cluster
            <ClusterMarker
              key={cluster.id}
              cluster={cluster}
              onPress={onClusterPress}
            />
          )
        )
      ) : (
        // Render individual place markers without clustering (only visible ones)
        visiblePlaces.map((place) => (
          <PlaceMarker
            key={`place-${place.id}`}
            place={place}
            onPress={onPlacePress}
          />
        ))
      )}

      {/* Render post markers or clusters */}
      {usePostClustering ? (
        // Render post clusters
        postClusters.map((cluster) =>
          cluster.count === 1 ? (
            // Single post - render as regular marker
            onPostPress && (
              <PostMarker
                key={`post-${cluster.posts[0].id}`}
                post={cluster.posts[0]}
                onPress={onPostPress}
              />
            )
          ) : (
            // Multiple posts - render as cluster
            onPostClusterPress && (
              <PostClusterMarker
                key={cluster.id}
                cluster={cluster}
                onPress={onPostClusterPress}
              />
            )
          )
        )
      ) : (
        // Render individual post markers without clustering
        onPostPress && visiblePosts.map((post) => (
          <PostMarker
            key={`post-${post.id}`}
            post={post}
            onPress={onPostPress}
          />
        ))
      )}

      {/* Render current user marker when showing friends */}
      {showFriends && currentUser && onFriendPress && (
        <FriendMarker
          key={`current-user-${currentUser.userId}`}
          friend={currentUser}
          onPress={onFriendPress}
          animationEnabled={true}
        />
      )}

      {/* Render friend markers */}
      {showFriends && onFriendPress && visibleFriends.map((friend) => {
        console.log('🗺️ [MapView] Rendering FriendMarker:', {
          userId: friend.userId,
          name: friend.name,
          lat: friend.latitude,
          lng: friend.longitude,
        });
        return (
          <FriendMarker
            key={`friend-${friend.userId}`}
            friend={friend}
            onPress={onFriendPress}
            animationEnabled={true}
          />
        );
      })}

      {/* Render mission markers */}
      {visibleMissions.map((mission) => (
        <MissionMarker
          key={`mission-${mission.id}`}
          mission={mission}
          onPress={onMissionPress}
        />
      ))}
    </RNMapView>
  );
};

const styles = StyleSheet.create({
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
});
