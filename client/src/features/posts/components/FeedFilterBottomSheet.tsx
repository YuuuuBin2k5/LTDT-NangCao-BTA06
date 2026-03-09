/**
 * Bottom sheet for selecting feed filters
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import type { FilterConfig, FilterType } from '../types/filter.types';

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  activeFilters: FilterConfig[];
  onApplyFilters: (filters: FilterConfig[]) => void;
}

const FILTER_OPTIONS = {
  recommendation: [
    { id: 'for_you', value: 'for_you', label: '✨ Dành cho bạn' },
    { id: 'discovery', value: 'discovery', label: '🔍 Khám phá' },
  ],
  social: [
    { id: 'friends', value: 'friends', label: '👥 Bạn bè' },
    { id: 'friends_of_friends', value: 'friends_of_friends', label: '👥👥 Bạn của bạn bè' },
  ],
  location: [
    { id: 'nearby', value: 'nearby', label: '📍 Gần đây (5km)', params: { radius: 5 } },
    { id: 'nearby_10', value: 'nearby', label: '📍 Gần đây (10km)', params: { radius: 10 } },
  ],
  content: [
    { id: 'photos', value: 'photos_only', label: '📷 Chỉ ảnh' },
    { id: 'check_ins', value: 'check_ins', label: '📌 Check-in' },
    { id: 'long_posts', value: 'long_posts', label: '📝 Bài dài' },
  ],
  time: [
    { id: 'today', value: 'today', label: '📅 Hôm nay' },
    { id: 'this_week', value: 'this_week', label: '📅 Tuần này' },
    { id: 'this_month', value: 'this_month', label: '📅 Tháng này' },
  ],
  engagement: [
    { id: 'trending', value: 'trending', label: '🔥 Xu hướng' },
    { id: 'most_liked', value: 'most_liked', label: '❤️ Nhiều thích nhất' },
    { id: 'most_discussed', value: 'most_discussed', label: '💬 Nhiều bình luận nhất' },
  ],
};

export const FeedFilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  activeFilters,
  onApplyFilters,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<FilterConfig[]>(activeFilters);

  const toggleFilter = (type: FilterType, option: any) => {
    const filterId = option.id;
    const exists = selectedFilters.some(f => f.id === filterId);

    if (exists) {
      setSelectedFilters(prev => prev.filter(f => f.id !== filterId));
    } else {
      const newFilter: FilterConfig = {
        id: filterId,
        type,
        value: option.value,
        label: option.label,
        params: option.params,
      };
      setSelectedFilters(prev => [...prev, newFilter]);
    }
  };

  const isSelected = (filterId: string) => {
    return selectedFilters.some(f => f.id === filterId);
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onClose();
  };

  const handleClear = () => {
    setSelectedFilters([]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bộ lọc bảng tin</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Recommendation Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Gợi ý thông minh</Text>
              <Text style={styles.sectionDescription}>
                Sử dụng AI để gợi ý nội dung phù hợp với bạn
              </Text>
              {FILTER_OPTIONS.recommendation.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, isSelected(option.id) && styles.optionSelected]}
                  onPress={() => toggleFilter('RECOMMENDATION' as FilterType, option)}
                >
                  <Text style={[styles.optionText, isSelected(option.id) && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected(option.id) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Social Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Xã hội</Text>
              {FILTER_OPTIONS.social.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, isSelected(option.id) && styles.optionSelected]}
                  onPress={() => toggleFilter('SOCIAL' as FilterType, option)}
                >
                  <Text style={[styles.optionText, isSelected(option.id) && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected(option.id) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Location Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Vị trí</Text>
              {FILTER_OPTIONS.location.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, isSelected(option.id) && styles.optionSelected]}
                  onPress={() => toggleFilter('LOCATION' as FilterType, option)}
                >
                  <Text style={[styles.optionText, isSelected(option.id) && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected(option.id) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Content Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Nội dung</Text>
              {FILTER_OPTIONS.content.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, isSelected(option.id) && styles.optionSelected]}
                  onPress={() => toggleFilter('CONTENT' as FilterType, option)}
                >
                  <Text style={[styles.optionText, isSelected(option.id) && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected(option.id) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏰ Thời gian</Text>
              {FILTER_OPTIONS.time.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, isSelected(option.id) && styles.optionSelected]}
                  onPress={() => toggleFilter('TIME' as FilterType, option)}
                >
                  <Text style={[styles.optionText, isSelected(option.id) && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected(option.id) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Engagement Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Tương tác</Text>
              {FILTER_OPTIONS.engagement.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, isSelected(option.id) && styles.optionSelected]}
                  onPress={() => toggleFilter('ENGAGEMENT' as FilterType, option)}
                >
                  <Text style={[styles.optionText, isSelected(option.id) && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected(option.id) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Xóa tất cả</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                Áp dụng {selectedFilters.length > 0 && `(${selectedFilters.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
