import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as Location from 'expo-location';
import { useFeedPosts } from "../../../src/features/posts/hooks/useFeedPosts";
import { useFeedFilters } from "../../../src/features/posts/hooks/useFeedFilters";
import { PostCard } from "../../../src/features/posts/components/PostCard";
import { FilterBar } from "../../../src/features/posts/components/FilterBar";
import { ActiveFiltersBar } from "../../../src/features/posts/components/ActiveFiltersBar";
import { FeedFilterBottomSheet } from "../../../src/features/posts/components/FeedFilterBottomSheet";
import { FilterPresetManager } from "../../../src/features/posts/components/FilterPresetManager";
import { TrendingPlacesHorizontal } from "../../../src/features/posts/components/TrendingPlacesHorizontal";
import { TrendingPostsMasonry } from "../../../src/features/posts/components/TrendingPostsMasonry";
import type { Post } from "../../../src/features/posts/types/post.types";
import type { FilterConfig } from "../../../src/features/posts/types/filter.types";

export default function FeedScreen() {
  const router = useRouter();
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [presetManagerVisible, setPresetManagerVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    toggleFilter,
    hasActiveFilters,
  } = useFeedFilters();

  // Get user location for location-based filters
  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);
  
  const {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useFeedPosts({
    filters,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    radius: 5,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const handlePostPress = useCallback((post: Post) => {
    router.push(`/post/${post.id}` as any);
  }, [router]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  const handleFilterPress = useCallback((filter: FilterConfig) => {
    toggleFilter(filter);
  }, [toggleFilter]);

  const handleApplyFilters = useCallback((newFilters: FilterConfig[]) => {
    clearFilters();
    newFilters.forEach(filter => addFilter(filter));
  }, [clearFilters, addFilter]);

  const handleApplyPreset = useCallback((presetFilters: FilterConfig[]) => {
    clearFilters();
    presetFilters.forEach(filter => addFilter(filter));
  }, [clearFilters, addFilter]);

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <PostCard post={item} onPress={handlePostPress} />
    </View>
  ), [handlePostPress]);

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>📰 Bảng tin</Text>
      </View>
      
      <FilterBar
        activeFilters={filters}
        onFilterPress={handleFilterPress}
        onMorePress={() => setFilterSheetVisible(true)}
        onPresetsPress={() => setPresetManagerVisible(true)}
      />
      
      <ActiveFiltersBar
        filters={filters}
        onRemove={removeFilter}
        onClear={clearFilters}
      />
      
      {/* 2. TOP 10 ĐỊA ĐIỂM HOT (SLIDE NGANG) */}
      {!hasActiveFilters && <TrendingPlacesHorizontal />}
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Đang tải...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading && posts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Đang tải bảng tin...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>❌</Text>
          <Text style={styles.emptyText}>Không thể tải bảng tin</Text>
          <Text style={styles.emptySubtext}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
        <Text style={styles.emptySubtext}>
          {hasActiveFilters 
            ? 'Thử thay đổi bộ lọc để xem thêm nội dung'
            : 'Kết bạn để xem bài viết của họ'}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersButtonText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Check if Trending Engagement filter is active
  const isTrendingFilterActive = filters.some(f => f.type === 'ENGAGEMENT' && f.value === 'trending');

  return (
    <View style={styles.container}>
      {isTrendingFilterActive ? (
        // 3. 20 BÀI VIẾT XU HƯỚNG CHIA 2 CỘT TƯƠNG TÁC
        <View style={styles.trendingContainer}>
          {renderHeader()}
          <TrendingPostsMasonry />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          contentContainerStyle={[
            posts.length === 0 ? styles.emptyList : undefined,
            { paddingBottom: 80 }
          ]}
        />
      )}
      
      <FeedFilterBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        activeFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
      
      <FilterPresetManager
        visible={presetManagerVisible}
        onClose={() => setPresetManagerVisible(false)}
        currentFilters={filters}
        onApplyPreset={handleApplyPreset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  trendingContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  postContainer: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearFiltersButton: {
    marginTop: 16,
    backgroundColor: '#ff3b30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
