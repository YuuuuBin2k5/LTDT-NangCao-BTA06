/**
 * Component for managing filter presets
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useFilterPresets } from '../hooks/useFilterPresets';
import type { FilterPreset, FilterConfig } from '../types/filter.types';
import { FILTER_LABELS } from '../types/filter.types';

interface FilterPresetManagerProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: FilterConfig[];
  onApplyPreset: (filters: FilterConfig[]) => void;
}

export const FilterPresetManager: React.FC<FilterPresetManagerProps> = ({
  visible,
  onClose,
  currentFilters,
  onApplyPreset,
}) => {
  const {
    presets,
    isLoading,
    savePreset,
    deletePreset,
    applyPreset,
    sharePreset,
    setDefaultPreset,
  } = useFilterPresets();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCurrentFilters = async () => {
    if (!presetName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bộ lọc');
      return;
    }

    if (currentFilters.length === 0) {
      Alert.alert('Lỗi', 'Không có bộ lọc nào để lưu');
      return;
    }

    setIsSaving(true);
    try {
      await savePreset(presetName.trim(), presetDescription.trim() || undefined, currentFilters);
      Alert.alert('Thành công', 'Đã lưu bộ lọc');
      setShowSaveDialog(false);
      setPresetName('');
      setPresetDescription('');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu bộ lọc');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePreset = (preset: FilterPreset) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa bộ lọc "${preset.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePreset(preset.id);
              Alert.alert('Thành công', 'Đã xóa bộ lọc');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bộ lọc');
            }
          },
        },
      ]
    );
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    try {
      const filters = applyPreset(preset.id);
      onApplyPreset(filters);
      onClose();
      Alert.alert('Thành công', `Đã áp dụng bộ lọc "${preset.name}"`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể áp dụng bộ lọc');
    }
  };

  const handleSharePreset = async (preset: FilterPreset) => {
    try {
      const shareToken = await sharePreset(preset.id);
      const shareUrl = `mapic://preset/${shareToken}`;
      
      await Share.share({
        message: `Thử bộ lọc "${preset.name}" của tôi trên Mapic!\n\n${shareUrl}`,
        title: `Chia sẻ bộ lọc: ${preset.name}`,
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chia sẻ bộ lọc');
    }
  };

  const handleSetDefault = async (preset: FilterPreset) => {
    try {
      await setDefaultPreset(preset.id);
      Alert.alert('Thành công', `Đã đặt "${preset.name}" làm mặc định`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt làm mặc định');
    }
  };

  const renderPresetItem = ({ item }: { item: FilterPreset }) => (
    <View style={styles.presetItem}>
      <View style={styles.presetHeader}>
        <View style={styles.presetTitleContainer}>
          <Text style={styles.presetName}>{item.name}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Mặc định</Text>
            </View>
          )}
        </View>
        <Text style={styles.usageCount}>Đã dùng {item.usageCount} lần</Text>
      </View>

      {item.description && (
        <Text style={styles.presetDescription}>{item.description}</Text>
      )}

      <View style={styles.filterTags}>
        {item.filters.map((filter, index) => (
          <View key={index} style={styles.filterTag}>
            <Text style={styles.filterTagText}>
              {FILTER_LABELS[filter.value] || filter.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.presetActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.applyButton]}
          onPress={() => handleApplyPreset(item)}
        >
          <Text style={styles.applyButtonText}>Áp dụng</Text>
        </TouchableOpacity>

        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item)}
          >
            <Text style={styles.actionButtonText}>Đặt mặc định</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSharePreset(item)}
        >
          <Text style={styles.actionButtonText}>Chia sẻ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePreset(item)}
        >
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bộ lọc đã lưu</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Đóng</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <>
            <FlatList
              data={presets}
              renderItem={renderPresetItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Chưa có bộ lọc nào được lưu</Text>
                  <Text style={styles.emptySubtext}>
                    Tạo bộ lọc và nhấn "Lưu" để sử dụng lại sau
                  </Text>
                </View>
              }
            />

            {currentFilters.length > 0 && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => setShowSaveDialog(true)}
              >
                <Text style={styles.saveButtonText}>💾 Lưu bộ lọc hiện tại</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Save Dialog */}
        <Modal
          visible={showSaveDialog}
          animationType="fade"
          transparent
          onRequestClose={() => setShowSaveDialog(false)}
        >
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogContainer}>
              <Text style={styles.dialogTitle}>Lưu bộ lọc</Text>

              <TextInput
                style={styles.input}
                placeholder="Tên bộ lọc"
                value={presetName}
                onChangeText={setPresetName}
                maxLength={100}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả (tùy chọn)"
                value={presetDescription}
                onChangeText={setPresetDescription}
                maxLength={500}
                multiline
                numberOfLines={3}
              />

              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.cancelButton]}
                  onPress={() => {
                    setShowSaveDialog(false);
                    setPresetName('');
                    setPresetDescription('');
                  }}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dialogButton, styles.confirmButton]}
                  onPress={handleSaveCurrentFilters}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  presetItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  presetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  usageCount: {
    fontSize: 12,
    color: '#666',
  },
  presetDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterTagText: {
    fontSize: 12,
    color: '#333',
  },
  presetActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dialogButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
