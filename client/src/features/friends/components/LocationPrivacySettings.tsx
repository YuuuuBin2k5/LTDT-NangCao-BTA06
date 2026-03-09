import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { PrivacyMode } from '../../../shared/types/location.types';
import { useLocationPrivacy } from '../hooks/useLocationPrivacy';
import { useToast } from '../../../shared/contexts/ToastContext';
import { CloseFriendsManager } from './CloseFriendsManager';

interface LocationPrivacySettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationPrivacySettings: React.FC<LocationPrivacySettingsProps> = ({
  visible,
  onClose,
}) => {
  const {
    privacyMode,
    setPrivacyMode,
    loadPrivacySettings,
    closeFriendIds,
    updateCloseFriends,
  } = useLocationPrivacy();
  const { showToast } = useToast();
  const [showCloseFriendsManager, setShowCloseFriendsManager] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPrivacySettings();
    }
  }, [visible, loadPrivacySettings]);

  const handlePrivacyModeChange = async (mode: PrivacyMode) => {
    try {
      await setPrivacyMode(mode);
      showToast(getPrivacyModeMessage(mode), 'success');
    } catch (error) {
      console.error('Failed to update privacy mode:', error);
      showToast('Không thể cập nhật chế độ riêng tư', 'error');
    }
  };

  const getPrivacyModeMessage = (mode: PrivacyMode): string => {
    switch (mode) {
      case PrivacyMode.ALL_FRIENDS:
        return 'Tất cả bạn bè có thể thấy vị trí của bạn';
      case PrivacyMode.CLOSE_FRIENDS:
        return 'Chỉ bạn thân có thể thấy vị trí của bạn';
      case PrivacyMode.GHOST_MODE:
        return 'Bạn đã ẩn vị trí của mình';
      default:
        return 'Đã cập nhật chế độ riêng tư';
    }
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
            <Text style={styles.title}>Quyền riêng tư vị trí</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Privacy Mode Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ai có thể thấy vị trí của bạn?</Text>

              {/* All Friends */}
              <TouchableOpacity
                style={[
                  styles.option,
                  privacyMode === PrivacyMode.ALL_FRIENDS && styles.optionSelected,
                ]}
                onPress={() => handlePrivacyModeChange(PrivacyMode.ALL_FRIENDS)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>👥</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Tất cả bạn bè</Text>
                    <Text style={styles.optionDescription}>
                      Tất cả bạn bè có thể thấy vị trí của bạn
                    </Text>
                  </View>
                </View>
                {privacyMode === PrivacyMode.ALL_FRIENDS && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              {/* Close Friends */}
              <TouchableOpacity
                style={[
                  styles.option,
                  privacyMode === PrivacyMode.CLOSE_FRIENDS && styles.optionSelected,
                ]}
                onPress={() => handlePrivacyModeChange(PrivacyMode.CLOSE_FRIENDS)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>⭐</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Chỉ bạn thân</Text>
                    <Text style={styles.optionDescription}>
                      Chỉ những người trong danh sách bạn thân ({closeFriendIds?.length || 0})
                    </Text>
                  </View>
                </View>
                {privacyMode === PrivacyMode.CLOSE_FRIENDS && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              {/* Manage Close Friends Button */}
              {privacyMode === PrivacyMode.CLOSE_FRIENDS && (
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => setShowCloseFriendsManager(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.manageButtonText}>Quản lý bạn thân</Text>
                  <Text style={styles.manageButtonIcon}>→</Text>
                </TouchableOpacity>
              )}

              {/* Ghost Mode */}
              <TouchableOpacity
                style={[
                  styles.option,
                  privacyMode === PrivacyMode.GHOST_MODE && styles.optionSelected,
                ]}
                onPress={() => handlePrivacyModeChange(PrivacyMode.GHOST_MODE)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>👻</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Chế độ ẩn danh</Text>
                    <Text style={styles.optionDescription}>
                      Ẩn vị trí của bạn khỏi tất cả mọi người
                    </Text>
                  </View>
                </View>
                {privacyMode === PrivacyMode.GHOST_MODE && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Bạn có thể thay đổi cài đặt này bất cứ lúc nào. Vị trí của bạn chỉ được
                chia sẻ khi ứng dụng đang mở.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Close Friends Manager Modal */}
      <CloseFriendsManager
        visible={showCloseFriendsManager}
        onClose={() => setShowCloseFriendsManager(false)}
        closeFriendIds={closeFriendIds || []}
        onUpdate={updateCloseFriends}
      />
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
    height: 550, // Định nghĩa chiều cao cố định để tránh bị sụp layout (collapse)
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
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
  },
  checkmark: {
    fontSize: 24,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  manageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  manageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2196F3',
  },
  manageButtonIcon: {
    fontSize: 20,
    color: '#2196F3',
  },
});
