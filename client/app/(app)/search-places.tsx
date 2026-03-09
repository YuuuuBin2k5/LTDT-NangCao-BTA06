import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocationSearch } from '../../src/features/map/hooks/useLocationSearch';
import { FilterBottomSheet } from '../../src/features/map/components/FilterBottomSheet';
import type { Place } from '../../src/services/location/location.service';

export default function SearchPlacesScreen() {
  const router = useRouter();
  const {
    places,
    isLoading,
    error,
    searchKeyword,
    setSearchKeyword,
    filters,
    updateFilters,
    loadMore,
    hasMore,
    refresh,
  } = useLocationSearch();

  const [filterVisible, setFilterVisible] = useState(false);

  const handlePlacePress = (place: Place) => {
    router.push(`/place/${place.id}` as any);
  };

  const renderPlaceItem = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.placeItem}
      onPress={() => handlePlacePress(item)}
    >
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeCategory}>{item.category}</Text>
        {item.averageRating > 0 && (
          <Text style={styles.placeRating}>⭐ {item.averageRating.toFixed(1)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#2ecc71" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {error ? '❌ Lỗi tải dữ liệu' : '📍 Không tìm thấy địa điểm'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm địa điểm..."
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={styles.filterButtonText}>🔍</Text>
          {(filters.category || filters.minRating > 0 || filters.hasPost) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <FlatList
        data={places}
        renderItem={renderPlaceItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshing={isLoading}
        onRefresh={refresh}
        contentContainerStyle={styles.listContent}
      />

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        selectedCategory={filters.category}
        onCategoryChange={(category) => updateFilters({ category })}
        minRating={filters.minRating}
        onRatingChange={(rating) => updateFilters({ minRating: rating })}
        hasPost={filters.hasPost}
        onHasPostChange={(hasPost) => updateFilters({ hasPost })}
        onApplyFilters={() => setFilterVisible(false)}
        onClearFilters={() => {
          updateFilters({ category: null, minRating: 0, hasPost: false });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    marginLeft: 8,
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  listContent: {
    padding: 16,
  },
  placeItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  placeRating: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
