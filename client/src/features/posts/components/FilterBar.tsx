/**
 * Horizontal scrollable filter bar with quick access chips
 */
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import type { FilterConfig } from '../types/filter.types';

interface FilterBarProps {
  activeFilters: FilterConfig[];
  onFilterPress: (filter: FilterConfig) => void;
  onMorePress: () => void;
  onPresetsPress?: () => void;
}

const QUICK_FILTERS: FilterConfig[] = [
  {
    id: 'for_you',
    type: 'RECOMMENDATION' as any,
    value: 'for_you',
    label: '✨ Dành cho bạn',
  },
  {
    id: 'friends',
    type: 'SOCIAL' as any,
    value: 'friends',
    label: '👥 Bạn bè',
  },
  {
    id: 'nearby',
    type: 'LOCATION' as any,
    value: 'nearby',
    label: '📍 Gần đây',
    params: { radius: 5 },
  },
  {
    id: 'photos',
    type: 'CONTENT' as any,
    value: 'photos_only',
    label: '📷 Ảnh',
  },
  {
    id: 'trending',
    type: 'ENGAGEMENT' as any,
    value: 'trending',
    label: '🔥 Xu hướng',
  },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilters,
  onFilterPress,
  onMorePress,
  onPresetsPress,
}) => {
  const isActive = (filterId: string) => {
    return activeFilters.some(f => f.id === filterId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {onPresetsPress && (
          <TouchableOpacity style={styles.presetsButton} onPress={onPresetsPress}>
            <Text style={styles.presetsButtonText}>💾 Đã lưu</Text>
          </TouchableOpacity>
        )}
        
        {QUICK_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.chip, isActive(filter.id) && styles.chipActive]}
            onPress={() => onFilterPress(filter)}
          >
            <Text style={[styles.chipText, isActive(filter.id) && styles.chipTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
          <Text style={styles.moreButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
  },
  moreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  moreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  presetsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    marginRight: 8,
  },
  presetsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});
