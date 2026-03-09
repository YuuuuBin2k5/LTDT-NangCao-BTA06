import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { AvatarFrame } from '../../../shared/types/avatar-frame.types';
import { avatarFrameService } from '../../../services/avatar/avatar-frame.service';
import { useToast } from '../../../shared/contexts/ToastContext';

interface AvatarFrameSelectorProps {
  visible: boolean;
  onClose: () => void;
  onFrameSelected?: (frameId: string) => void;
}

export const AvatarFrameSelector: React.FC<AvatarFrameSelectorProps> = ({
  visible,
  onClose,
  onFrameSelected,
}) => {
  const [frames, setFrames] = useState<AvatarFrame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (visible) {
      loadFrames();
    }
  }, [visible]);

  const loadFrames = async () => {
    try {
      setIsLoading(true);
      const allFrames = await avatarFrameService.getAllFrames();
      setFrames(allFrames);
      
      // Find currently selected frame
      const selected = allFrames.find((f) => f.isSelected);
      if (selected) {
        setSelectedFrameId(selected.id);
      }
    } catch (error) {
      console.error('Failed to load frames:', error);
      showToast('Không thể tải khung ảnh', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFramePress = async (frame: AvatarFrame) => {
    if (!frame.isUnlocked) {
      showToast('Khung ảnh này chưa được mở khóa', 'info');
      return;
    }

    try {
      await avatarFrameService.selectFrame(frame.id);
      setSelectedFrameId(frame.id);
      showToast(`Đã chọn khung "${frame.name}"`, 'success');
      
      if (onFrameSelected) {
        onFrameSelected(frame.id);
      }
      
      // Reload to update selected status
      await loadFrames();
    } catch (error) {
      console.error('Failed to select frame:', error);
      showToast('Không thể chọn khung ảnh', 'error');
    }
  };

  const renderFrameItem = ({ item }: { item: AvatarFrame }) => {
    const isSelected = item.id === selectedFrameId || item.isSelected;
    const isLocked = !item.isUnlocked;

    return (
      <TouchableOpacity
        style={[
          styles.frameItem,
          isSelected && styles.frameItemSelected,
          isLocked && styles.frameItemLocked,
        ]}
        onPress={() => handleFramePress(item)}
        disabled={isLocked}
        activeOpacity={0.7}
      >
        <View style={styles.framePreview}>
          {/* Frame preview would render SVG here */}
          <View
            style={[
              styles.framePlaceholder,
              { borderColor: isLocked ? '#ccc' : '#2196F3' },
            ]}
          >
            <Text style={styles.frameIcon}>🖼️</Text>
          </View>
          
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
          
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedIcon}>✓</Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.frameName, isLocked && styles.frameNameLocked]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {item.isPremium && !isLocked && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>⭐</Text>
          </View>
        )}

        {isLocked && item.unlockCondition && (
          <Text style={styles.unlockCondition} numberOfLines={2}>
            {item.unlockCondition}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chọn khung ảnh</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <FlatList
              data={frames}
              renderItem={renderFrameItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  frameItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frameItemSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  frameItemLocked: {
    opacity: 0.6,
  },
  framePreview: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  framePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  frameIcon: {
    fontSize: 32,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 35,
  },
  lockIcon: {
    fontSize: 24,
  },
  selectedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  frameName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  frameNameLocked: {
    color: '#999',
  },
  premiumBadge: {
    marginTop: 4,
  },
  premiumText: {
    fontSize: 12,
  },
  unlockCondition: {
    marginTop: 4,
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});
