import React, { useEffect, useState, useCallback, useRef } from "react";
import { StyleSheet, View, Alert, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../src/store/contexts";
import { MapView } from "../../../src/features/map/components/MapView";
import { MapLayerToggle, MapLayer } from "../../../src/features/map/components/MapLayerToggle";
import { MapWarningBanner } from "../../../src/features/map/components/MapWarningBanner";
import { PostCard } from "../../../src/features/posts/components/PostCard";
import { CreatePostButton } from "../../../src/features/posts/components/CreatePostButton";
import { OfflineSyncBanner } from "../../../src/features/posts/components/OfflineSyncBanner";
import { FriendDetailsBottomSheet } from "../../../src/features/friends/components/FriendDetailsBottomSheet";
import { InteractionEffectOverlay } from "../../../src/features/friends/components/InteractionEffectOverlay";
import { LocationPrivacySettings } from "../../../src/features/friends/components/LocationPrivacySettings";
import { StatusInputDialog } from "../../../src/features/friends/components/StatusInputDialog";
import { useLocationTracking } from "../../../src/features/map/hooks/useLocationTracking";
import { useNearbyPosts } from "../../../src/features/posts/hooks/useNearbyPosts";
import { useFriendLocations } from "../../../src/features/friends/hooks/useFriendLocations";
import { useInteractionEffects } from "../../../src/features/friends/hooks/useInteractionEffects";
import { useLocationPrivacy } from "../../../src/features/friends/hooks/useLocationPrivacy";
import { friendLocationService } from "../../../src/services/location/friend-location.service";
import { useMissions } from "../../../src/features/missions/hooks/useMissions";
import { useMissionTracker } from "../../../src/features/missions/hooks/useMissionTracker";
import { ActiveMissionsOverlay } from "../../../src/features/missions/components/ActiveMissionsOverlay";
import type { Post } from "../../../src/features/posts/types/post.types";
import type { PostCluster } from "../../../src/features/map/utils/clustering";
import { FriendLocation, PrivacyMode } from "../../../src/shared/types/location.types";
import type { MapRegion } from "../../../src/features/map/types";

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    focusMissionId?: string;
    lat?: string;
    lng?: string;
  }>();
  const { user } = useAuth();
  const {
    currentLocation,
    mapRegion,
    isTracking,
    permissionGranted,
    error,
    startTracking,
  } = useLocationTracking();

  const { 
    posts, 
    isLoading, 
    error: postsError,
    refresh 
  } = useNearbyPosts({
    latitude: currentLocation?.latitude || 0,
    longitude: currentLocation?.longitude || 0,
    radius: 5.0,
    enabled: !!currentLocation,
  });

  const {
    friendLocations,
    isLoading: friendsLoading,
    error: friendsError,
    refresh: refreshFriends,
  } = useFriendLocations();

  // Integrated Mission Hooks
  const { data: missionsData } = useMissions({});
  const allMissions = missionsData?.pages.flatMap(p => p.content) ?? [];
  const { tracker } = useMissionTracker();
  const activeMissions = tracker?.items?.filter(i => 
    ['ACTIVE', 'IN_PROGRESS', 'AT_LOCATION'].includes(i.status)
  ) ?? [];

  // Logic: Nếu có nhiệm vụ đang thực hiện, chỉ hiện các nhiệm vụ đó trên map. 
  // Nếu không, hiện tất cả nhiệm vụ lân cận.
  let displayedMissions = activeMissions.length > 0 
    ? activeMissions.map(item => item.mission)
    : allMissions;
    
  // Deduplicate missions by ID to prevent key collision warnings
  displayedMissions = (displayedMissions || []).filter(
    (mission, index, self) => index === self.findIndex((m) => m.id === mission.id)
  );

  const { activeEffects, removeEffect } = useInteractionEffects();
  const { privacyMode, loadPrivacySettings } = useLocationPrivacy();
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<FriendLocation | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayer>('posts');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showStatusInput, setShowStatusInput] = useState(false);
  const [dynamicMapRegion, setDynamicMapRegion] = useState<MapRegion | undefined>(mapRegion);

  /**
   * Calculate region to fit all friends
   */
  const calculateFriendsRegion = useCallback((): MapRegion | undefined => {
    if (friendLocations.length === 0 || !currentLocation) {
      return mapRegion;
    }

    // Include current location and all friend locations
    const allLocations = [
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      ...friendLocations.map(f => ({ latitude: f.latitude, longitude: f.longitude }))
    ];

    const lats = allLocations.map(l => l.latitude);
    const lngs = allLocations.map(l => l.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5; // Add 50% padding
    const lngDelta = (maxLng - minLng) * 1.5;

    console.log('📍 Calculated friends region:', {
      centerLat,
      centerLng,
      latDelta,
      lngDelta,
      friendCount: friendLocations.length,
    });

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.05), // Minimum zoom level
      longitudeDelta: Math.max(lngDelta, 0.05),
    };
  }, [friendLocations, currentLocation, mapRegion]);

  /**
   * Update map region when switching to friends layer
   */
  useEffect(() => {
    if ((mapLayer === 'friends' || mapLayer === 'all') && friendLocations.length > 0) {
      const friendsRegion = calculateFriendsRegion();
      if (friendsRegion) {
        console.log('🗺️ Updating map region to show all friends');
        setDynamicMapRegion(friendsRegion);
      }
    } else if (mapLayer === 'posts') {
      // Reset to current location when switching back to posts
      setDynamicMapRegion(mapRegion);
    }
  }, [mapLayer, friendLocations, calculateFriendsRegion, mapRegion]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      if (mapLayer === 'friends' || mapLayer === 'all') {
        await refreshFriends();
      }
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refreshFriends, mapLayer]);

  /**
   * Render footer for FlatList (loading indicator)
   */
  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Đang tải...</Text>
      </View>
    );
  }, [isLoading]);

  /**
   * Render empty list component
   */
  const renderEmptyList = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Đang tải bài viết...</Text>
        </View>
      );
    }

    if (postsError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>❌ Lỗi tải bài viết</Text>
          <Text style={styles.emptySubtext}>{postsError.message}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📍 Chưa có bài viết nào</Text>
        <Text style={styles.emptySubtext}>Hãy là người đầu tiên đăng bài ở đây!</Text>
      </View>
    );
  }, [isLoading, postsError]);

  /**
   * Render post card item
   */
  const renderPostItem = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onPress={handlePostCardPress}
    />
  ), []);

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  /**
   * Start tracking when user is authenticated
   */
  useEffect(() => {
    if (user && permissionGranted && !isTracking) {
      startTracking();
    }
  }, [user, permissionGranted, isTracking, startTracking]);

  /**
   * Load privacy settings on mount
   */
  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user, loadPrivacySettings]);

  /**
   * Show error alert if permission denied or location error
   */
  useEffect(() => {
    if (error && !permissionGranted) {
      Alert.alert(
        "Lỗi vị trí",
        "Không thể lấy vị trí hiện tại. Vui lòng bật GPS hoặc kiểm tra cài đặt vị trí.",
        [{ text: "OK" }]
      );
    }
  }, [error, permissionGranted]);

  /**
   * Handle focusing on a mission from navigation params
   */
  useEffect(() => {
    if (params.focusMissionId && params.lat && params.lng) {
      const lat = parseFloat(params.lat);
      const lng = parseFloat(params.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log('🎯 Focusing on mission:', params.focusMissionId);
        setDynamicMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        // Tự động chuyển layer sang missions hoặc all để thấy marker
        if (mapLayer !== 'all') {
          setMapLayer('missions');
        }
      }
    }
  }, [params.focusMissionId, params.lat, params.lng]);

  /**
   * Handle post marker press
   */
  const handlePostPress = useCallback((post: Post) => {
    setSelectedPost(post);
  }, []);

  /**
   * Handle post cluster marker press
   */
  const handlePostClusterPress = useCallback((cluster: PostCluster) => {
    Alert.alert(
      "Nhóm bài viết",
      `Có ${cluster.count} bài viết trong khu vực này. Thu phóng để xem chi tiết.`,
      [{ text: "OK" }]
    );
  }, []);

  /**
   * Handle post card press - navigate to post detail
   */
  const handlePostCardPress = useCallback((post: Post) => {
    router.push(`/post/${post.id}` as any);
  }, [router]);

  /**
   * Handle create post button press
   */
  const handleCreatePost = useCallback(() => {
    if (!user) {
      Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để đăng bài");
      return;
    }
    router.push("/create-post");
  }, [user, router]);

  /**
   * Handle search places button press
   */
  const handleSearchPlaces = useCallback(() => {
    router.push("/search-places");
  }, [router]);

  /**
   * Handle mission marker press
   */
  const handleMissionFocus = useCallback((mission: any) => {
    setDynamicMapRegion({
      latitude: mission.latitude,
      longitude: mission.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  }, []);

  /**
   * Handle friend marker press
   */
  const handleFriendPress = useCallback((friend: FriendLocation) => {
    // If it's the current user's marker, show status input
    if (friend.userId === user?.id) {
      setShowStatusInput(true);
    } else {
      setSelectedFriend(friend);
    }
  }, [user]);

  /**
   * Handle status save
   */
  const handleStatusSave = useCallback(async (status: string, emoji?: string) => {
    try {
      await friendLocationService.updateStatus(status, emoji);
      // Refresh friend locations to show updated status
      await refreshFriends();
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  }, [refreshFriends]);

  /**
   * Get privacy mode label
   */
  const getPrivacyModeLabel = useCallback((mode: PrivacyMode): string => {
    switch (mode) {
      case PrivacyMode.ALL_FRIENDS:
        return '👥 Tất cả';
      case PrivacyMode.CLOSE_FRIENDS:
        return '⭐ Bạn thân';
      case PrivacyMode.GHOST_MODE:
        return '👻 Ẩn danh';
      default:
        return '👥';
    }
  }, []);

  return (
    <View style={styles.container}>
      {!user && <MapWarningBanner message="⚠️ Chưa đăng nhập" />}
      
      {/* Offline sync banner */}
      <OfflineSyncBanner />

      {/* Map Layer Toggle */}
      <View style={styles.layerToggleContainer}>
        <MapLayerToggle
          selectedLayer={mapLayer}
          onLayerChange={setMapLayer}
        />
      </View>

      {/* Privacy Mode Indicator */}
      {(mapLayer === 'friends' || mapLayer === 'all') && (
        <TouchableOpacity
          style={styles.privacyIndicator}
          onPress={() => setShowPrivacySettings(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.privacyText}>{getPrivacyModeLabel(privacyMode)}</Text>
        </TouchableOpacity>
      )}

      {/* Active Missions Overlay */}
      {activeMissions.length > 0 && (mapLayer === 'missions' || mapLayer === 'all') && (
        <ActiveMissionsOverlay 
          activeItems={activeMissions}
          onFocusMission={(item) => handleMissionFocus(item.mission)}
          containerStyle={{
            bottom: mapLayer === 'all' && posts.length > 0 ? 280 : 100
          }}
        />
      )}

      <MapView
        initialRegion={dynamicMapRegion}
        currentLocation={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }
            : undefined
        }
        currentUser={user ? {
          userId: user.id,
          name: user.nickName || user.username,
          username: user.username,
          avatarUrl: user.avatarUrl || '',
          latitude: currentLocation?.latitude || 0,
          longitude: currentLocation?.longitude || 0,
          timestamp: new Date(),
          isOnline: true,
          statusMessage: undefined,
          statusEmoji: undefined,
        } : undefined}
        posts={mapLayer === 'posts' || mapLayer === 'all' ? posts : []}
        friendLocations={mapLayer === 'friends' || mapLayer === 'all' ? friendLocations : []}
        missions={mapLayer === 'missions' || mapLayer === 'all' ? displayedMissions : []}
        showFriends={mapLayer === 'friends' || mapLayer === 'all'}
        showsUserLocation={false}
        showsMyLocationButton={true}
        followsUserLocation={false}
        onPostPress={handlePostPress}
        onPostClusterPress={handlePostClusterPress}
        onFriendPress={handleFriendPress}
        onMissionPress={handleMissionFocus}
      />

      {/* Horizontal carousel for browsing posts */}
      {posts.length > 0 && (mapLayer === 'posts' || mapLayer === 'all') && (
        <View style={styles.carouselContainer}>
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={keyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={340}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#007AFF"
              />
            }
          />
        </View>
      )}

      {/* Show empty state when no results */}
      {posts.length === 0 && (mapLayer === 'posts' || mapLayer === 'all') && (
        <View style={styles.emptyStateContainer}>
          {renderEmptyList()}
        </View>
      )}

      {/* Show selected post card overlay */}
      {selectedPost && (mapLayer === 'posts' || mapLayer === 'all') && (
        <View style={styles.postCardContainer}>
          <PostCard
            post={selectedPost}
            onPress={handlePostCardPress}
          />
        </View>
      )}

      {/* Friend Details Bottom Sheet */}
      <FriendDetailsBottomSheet
        visible={selectedFriend !== null}
        friend={selectedFriend}
        currentLocation={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        } : undefined}
        onClose={() => setSelectedFriend(null)}
      />

      {/* Interaction Effect Overlay */}
      <InteractionEffectOverlay
        effects={activeEffects}
        onEffectComplete={removeEffect}
        mapRegion={mapRegion}
      />

      {/* Location Privacy Settings Modal */}
      <LocationPrivacySettings
        visible={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
      />

      {/* Status Input Dialog */}
      <StatusInputDialog
        visible={showStatusInput}
        onClose={() => setShowStatusInput(false)}
        onSave={handleStatusSave}
      />

      {/* Search Places Button */}
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={handleSearchPlaces}
      >
        <Text style={styles.searchButtonText}>🔍</Text>
      </TouchableOpacity>

      {/* Create Post Button */}
      <CreatePostButton onPress={handleCreatePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  layerToggleContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  privacyIndicator: {
    position: 'absolute',
    top: 60,
    right: 70,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  privacyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  searchButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchButtonText: {
    fontSize: 24,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 100, // Tăng từ 20 lên 100 để tránh bottom nav
    left: 0,
    right: 0,
    height: 180,
  },
  carouselContent: {
    paddingHorizontal: 8,
  },
  postCardContainer: {
    position: 'absolute',
    bottom: 100, // Tăng từ 20 lên 100 để tránh bottom nav
    left: 0,
    right: 0,
  },
  emptyStateContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
