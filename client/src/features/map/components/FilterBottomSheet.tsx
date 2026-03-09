import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { PlaceCategory } from '../../../services/location/location.service';
import { Button } from '../../../shared/components/Button';

export interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: PlaceCategory | null;
  onCategoryChange: (category: PlaceCategory | null) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  hasPost: boolean;
  onHasPostChange: (hasPost: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  [PlaceCategory.RESTAURANT]: 'Nhà hàng',
  [PlaceCategory.HOTEL]: 'Khách sạn',
  [PlaceCategory.PARK]: 'Công viên',
  [PlaceCategory.MUSEUM]: 'Bảo tàng',
  [PlaceCategory.SHOPPING]: 'Mua sắm',
  [PlaceCategory.ENTERTAINMENT]: 'Giải trí',
  [PlaceCategory.OTHER]: 'Khác',
};

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  selectedCategory,
  onCategoryChange,
  minRating,
  onRatingChange,
  hasPost,
  onHasPostChange,
  onApplyFilters,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedCategory !== null || minRating > 0 || hasPost;

  const handleApply = () => {
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Lọc kết quả</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <View style={styles.activeFiltersIndicator}>
              <Text style={styles.activeFiltersText}>
                🔍 {selectedCategory ? '1' : '0'} phân loại, {minRating > 0 ? '1' : '0'} đánh giá, {hasPost ? '1' : '0'} bài đăng
              </Text>
            </View>
          )}

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category Filter Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phân loại</Text>
              
              {/* All Categories Option */}
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => onCategoryChange(null)}
              >
                <View style={styles.radioButton}>
                  {selectedCategory === null && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Tất cả</Text>
              </TouchableOpacity>

              {/* Individual Category Options */}
              {Object.values(PlaceCategory).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.radioOption}
                  onPress={() => onCategoryChange(category)}
                >
                  <View style={styles.radioButton}>
                    {selectedCategory === category && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>{CATEGORY_LABELS[category]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Filter Section */}
            <View style={styles.section}>
              <View style={styles.ratingHeader}>
                <Text style={styles.sectionTitle}>Đánh giá tối thiểu</Text>
                <View style={styles.ratingValueContainer}>
                  <Text style={styles.ratingValue}>
                    {minRating === 0 ? 'Tất cả' : `${minRating.toFixed(1)} ⭐`}
                  </Text>
                </View>
              </View>
              
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={5}
                step={0.5}
                value={minRating}
                onValueChange={onRatingChange}
                minimumTrackTintColor="#2ecc71"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#2ecc71"
              />
              
              <View style={styles.ratingLabels}>
                <Text style={styles.ratingLabelText}>0</Text>
                <Text style={styles.ratingLabelText}>5</Text>
              </View>
            </View>

            {/* Has Post Filter Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Địa điểm có bài đăng</Text>
              
              <TouchableOpacity
                style={styles.checkboxOption}
                onPress={() => onHasPostChange(!hasPost)}
              >
                <View style={styles.checkbox}>
                  {hasPost && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Chỉ hiển thị địa điểm có bài đăng</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Xóa bộ lọc"
              onPress={handleClear}
              variant="outline"
              style={styles.clearButton}
            />
            <Button
              title="Áp dụng"
              onPress={handleApply}
              variant="primary"
              style={styles.applyButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  activeFiltersIndicator: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingValueContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ecc71',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  ratingLabelText: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxCheck: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});
