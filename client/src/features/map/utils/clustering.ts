import { Place } from '../../../services/location/location.service';
import type { Post } from '../../posts/types/post.types';
import type { FriendLocation } from '../../../shared/types/location.types';

/**
 * Base interface for items that can be clustered
 */
export interface ClusterableItem {
  id: number;
  latitude: number;
  longitude: number;
}

/**
 * Cluster interface representing a group of places
 */
export interface PlaceCluster {
  id: string;
  latitude: number;
  longitude: number;
  places: Place[];
  count: number;
}

/**
 * Cluster interface representing a group of posts
 */
export interface PostCluster {
  id: string;
  latitude: number;
  longitude: number;
  posts: Post[];
  count: number;
}

/**
 * Cluster interface representing a group of friends
 */
export interface FriendCluster {
  id: string;
  latitude: number;
  longitude: number;
  friends: FriendLocation[];
  count: number;
}

/**
 * Map region for clustering calculations
 */
export interface ClusterRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate clustering threshold based on map zoom level
 * Returns distance in kilometers
 */
const getClusteringThreshold = (region: ClusterRegion): number => {
  // Use latitudeDelta as a proxy for zoom level
  // Smaller delta = more zoomed in = smaller threshold
  const zoomLevel = region.latitudeDelta;
  
  if (zoomLevel > 10) return 50; // Very zoomed out
  if (zoomLevel > 5) return 20;
  if (zoomLevel > 1) return 5;
  if (zoomLevel > 0.5) return 2;
  if (zoomLevel > 0.1) return 0.5;
  return 0.1; // Very zoomed in - minimal clustering
};

/**
 * Cluster places based on proximity and map zoom level
 * @param places Array of places to cluster
 * @param region Current map region
 * @returns Array of clusters
 */
export const clusterPlaces = (
  places: Place[],
  region: ClusterRegion
): PlaceCluster[] => {
  if (places.length === 0) {
    return [];
  }

  const threshold = getClusteringThreshold(region);
  const clusters: PlaceCluster[] = [];
  const processed = new Set<number>();

  places.forEach((place, index) => {
    if (processed.has(index)) {
      return;
    }

    // Start a new cluster with this place
    const cluster: PlaceCluster = {
      id: `cluster-${place.id}`,
      latitude: place.latitude,
      longitude: place.longitude,
      places: [place],
      count: 1,
    };

    processed.add(index);

    // Find nearby places to add to this cluster
    places.forEach((otherPlace, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) {
        return;
      }

      const distance = calculateDistance(
        place.latitude,
        place.longitude,
        otherPlace.latitude,
        otherPlace.longitude
      );

      if (distance <= threshold) {
        cluster.places.push(otherPlace);
        cluster.count++;
        processed.add(otherIndex);

        // Update cluster center to average position
        cluster.latitude =
          cluster.places.reduce((sum, p) => sum + p.latitude, 0) /
          cluster.count;
        cluster.longitude =
          cluster.places.reduce((sum, p) => sum + p.longitude, 0) /
          cluster.count;
      }
    });

    clusters.push(cluster);
  });

  return clusters;
};

/**
 * Check if clustering should be applied based on number of places and zoom level
 */
export const shouldCluster = (
  placeCount: number,
  region: ClusterRegion
): boolean => {
  // Don't cluster if there are very few places
  if (placeCount < 10) {
    return false;
  }

  // Don't cluster when very zoomed in
  if (region.latitudeDelta < 0.05) {
    return false;
  }

  return true;
};

/**
 * Cluster posts based on proximity and map zoom level
 * @param posts Array of posts to cluster
 * @param region Current map region
 * @returns Array of clusters
 */
export const clusterPosts = (
  posts: Post[],
  region: ClusterRegion
): PostCluster[] => {
  if (posts.length === 0) {
    return [];
  }

  const threshold = getClusteringThreshold(region);
  const clusters: PostCluster[] = [];
  const processed = new Set<number>();

  posts.forEach((post, index) => {
    if (processed.has(index)) {
      return;
    }

    // Start a new cluster with this post
    const cluster: PostCluster = {
      id: `cluster-${post.id}`,
      latitude: post.latitude,
      longitude: post.longitude,
      posts: [post],
      count: 1,
    };

    processed.add(index);

    // Find nearby posts to add to this cluster
    posts.forEach((otherPost, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) {
        return;
      }

      const distance = calculateDistance(
        post.latitude,
        post.longitude,
        otherPost.latitude,
        otherPost.longitude
      );

      if (distance <= threshold) {
        cluster.posts.push(otherPost);
        cluster.count++;
        processed.add(otherIndex);

        // Update cluster center to average position
        cluster.latitude =
          cluster.posts.reduce((sum, p) => sum + p.latitude, 0) /
          cluster.count;
        cluster.longitude =
          cluster.posts.reduce((sum, p) => sum + p.longitude, 0) /
          cluster.count;
      }
    });

    clusters.push(cluster);
  });

  return clusters;
};

/**
 * Cluster friends based on proximity and map zoom level
 * @param friends Array of friends to cluster
 * @param region Current map region
 * @returns Array of clusters
 */
export const clusterFriends = (
  friends: FriendLocation[],
  region: ClusterRegion
): FriendCluster[] => {
  if (friends.length === 0) {
    return [];
  }

  const threshold = getClusteringThreshold(region);
  const clusters: FriendCluster[] = [];
  const processed = new Set<string>();

  friends.forEach((friend, index) => {
    if (processed.has(friend.userId)) {
      return;
    }

    // Start a new cluster with this friend
    const cluster: FriendCluster = {
      id: `cluster-${friend.userId}`,
      latitude: friend.latitude,
      longitude: friend.longitude,
      friends: [friend],
      count: 1,
    };

    processed.add(friend.userId);

    // Find nearby friends to add to this cluster
    friends.forEach((otherFriend, otherIndex) => {
      if (processed.has(otherFriend.userId) || index === otherIndex) {
        return;
      }

      const distance = calculateDistance(
        friend.latitude,
        friend.longitude,
        otherFriend.latitude,
        otherFriend.longitude
      );

      if (distance <= threshold) {
        cluster.friends.push(otherFriend);
        cluster.count++;
        processed.add(otherFriend.userId);

        // Update cluster center to average position
        cluster.latitude =
          cluster.friends.reduce((sum, f) => sum + f.latitude, 0) /
          cluster.count;
        cluster.longitude =
          cluster.friends.reduce((sum, f) => sum + f.longitude, 0) /
          cluster.count;
      }
    });

    clusters.push(cluster);
  });

  return clusters;
};
