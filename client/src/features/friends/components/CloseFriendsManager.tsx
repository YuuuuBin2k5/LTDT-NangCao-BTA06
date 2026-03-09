import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { friendshipService } from '../../../services/friendship/friendship.service';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';
import { useToast } from '../../../shared/contexts/ToastContext';

interface Friend {
  id: string;
  nickName: string;
  username: string;
  avatarUrl: string;
}

interface CloseFriendsManagerProps {
  visible: boolean;
  onClose: () => void;
  closeFriendIds: string[];
  onUpdate: (friendIds: string[]) => void;
}

/**
 * CloseFriendsManager - Manage close friends list for location privacy
 * Requirements: 5.2
 */
export const CloseFriendsManager: React.FC<CloseFriendsManagerProps> = ({
  visible,
  onClose,
  closeFriendIds,
  onUpdate,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(closeFriendIds));
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (visible) {
      loadFriends();
      setSelectedIds(new Set(closeFriendIds));
    }
  }, [visible, closeFriendIds]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsList = await friendshipService.getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
      showToast('Không thể tải danh sách bạn bè', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    onUpdate(Array.from(selectedIds));
    showToast(
      `Đã cập nhật ${selectedIds.size} bạn thân`,
      'success'
    );
    onClose();
  };

  const handleSelectAll = () => {
    if (selectedIds.size === friends.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(friends.map((f) => f.id)));
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
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Bạn thân</Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, styles.saveButton]}>Lưu</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Count */}
          <View style={styles.countSection}>
            <Text style={styles.countText}>
              Đã chọn {selectedIds.size} / {friends.length} bạn bè
            </Text>
            <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>
                {selectedIds.size === friends.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Friends List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : friends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>Chưa có bạn bè</Text>
              <Text style={styles.emptySubtext}>
                Kết bạn để thêm vào danh sách bạn thân
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.friendsList} showsVerticalScrollIndicator={false}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => toggleFriend(friend.id)}
                  activeOpacity={0.7}
                >
                  <OptimizedImage uri={friend.avatarUrl} style={styles.avatar} />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.nickName}</Text>
                    <Text style={styles.friendUsername}>@{friend.username}</Text>
                  </View>
                  <Switch
                    value={selectedIds.has(friend.id)}
                    onValueChange={() => toggleFriend(friend.id)}
                    trackColor={{ false: '#ddd', true: '#2196F3' }}
                    thumbColor="#fff"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Chỉ những người trong danh sách bạn thân mới có thể thấy vị trí của bạn khi
              bạn chọn chế độ "Chỉ bạn thân"
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    color: '#2196F3',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  countSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectAllButton: {
    padding: 4,
  },
  selectAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  friendUsername: {
    fontSize: 13,
    color: '#999',
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 16,
  },
});
