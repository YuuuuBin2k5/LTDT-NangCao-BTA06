import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { FriendLocation } from '../../../shared/types/location.types';
import { InteractionType } from '../../../shared/types/interaction.types';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';
import { friendInteractionService } from '../../../services/interaction/friend-interaction.service';
import { useToast } from '../../../shared/contexts/ToastContext';

interface FriendDetailsBottomSheetProps {
  visible: boolean;
  friend: FriendLocation | null;
  currentLocation?: { latitude: number; longitude: number };
  onClose: () => void;
}

export const FriendDetailsBottomSheet: React.FC<FriendDetailsBottomSheetProps> = ({
  visible,
  friend,
  currentLocation,
  onClose,
}) => {
  const [sendingInteraction, setSendingInteraction] = useState(false);
  const { showToast } = useToast();

  if (!friend) return null;

  const distance = currentLocation
    ? calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        friend.latitude,
        friend.longitude
      )
    : null;

  const handleSendInteraction = async (type: InteractionType) => {
    if (sendingInteraction) return;

    try {
      setSendingInteraction(true);
      await friendInteractionService.sendInteraction({
        toUserId: friend.userId,
        interactionType: type,
      });
      showToast(`Đã gửi ${getInteractionName(type)}!`, 'success');
    } catch (error: any) {
      if (error.code === 'INTERACTION_COOLDOWN') {
        showToast('Vui lòng đợi 10 giây trước khi gửi tiếp', 'info');
      } else {
        showToast('Không thể gửi tương tác', 'error');
      }
    } finally {
      setSendingInteraction(false);
    }
  };

  const handleGetDirections = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${friend.latitude},${friend.longitude}`,
      android: `geo:0,0?q=${friend.latitude},${friend.longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        showToast('Không thể mở bản đồ', 'error');
      });
    }
  };

  const interactions: Array<{ type: InteractionType; icon: string; label: string }> = [
    { type: InteractionType.HEART, icon: '❤️', label: 'Tim' },
    { type: InteractionType.WAVE, icon: '👋', label: 'Vẫy tay' },
    { type: InteractionType.POKE, icon: '👉', label: 'Chọc' },
    { type: InteractionType.FIRE, icon: '🔥', label: 'Lửa' },
    { type: InteractionType.STAR, icon: '⭐', label: 'Sao' },
    { type: InteractionType.HUG, icon: '🤗', label: 'Ôm' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.bottomSheet}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Friend Info */}
            <View style={styles.friendInfo}>
              <OptimizedImage
                uri={friend.avatarUrl}
                style={styles.avatar}
              />
              <View style={styles.friendDetails}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendUsername}>@{friend.username}</Text>
                {friend.isOnline ? (
                  <View style={styles.statusBadge}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusText}>Đang online</Text>
                  </View>
                ) : (
                  <Text style={styles.offlineText}>
                    {formatLastSeen(friend.lastSeenMinutes || 0)}
                  </Text>
                )}
              </View>
            </View>

            {/* Status Message */}
            {friend.statusMessage && (
              <View style={styles.statusSection}>
                {friend.statusEmoji && (
                  <Text style={styles.statusEmoji}>{friend.statusEmoji}</Text>
                )}
                <Text style={styles.statusMessage}>{friend.statusMessage}</Text>
              </View>
            )}

            {/* Distance */}
            {distance !== null && (
              <View style={styles.distanceSection}>
                <Text style={styles.distanceIcon}>📍</Text>
                <Text style={styles.distanceText}>
                  Cách bạn {formatDistance(distance)}
                </Text>
              </View>
            )}

            {/* Interactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gửi tương tác</Text>
              <View style={styles.interactionGrid}>
                {interactions.map((interaction) => (
                  <TouchableOpacity
                    key={interaction.type}
                    style={styles.interactionButton}
                    onPress={() => handleSendInteraction(interaction.type)}
                    disabled={sendingInteraction}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.interactionIcon}>{interaction.icon}</Text>
                    <Text style={styles.interactionLabel}>{interaction.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGetDirections}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>🗺️</Text>
                <Text style={styles.actionText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

const formatLastSeen = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút trước`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours} giờ trước`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days} ngày trước`;
  }
};

const getInteractionName = (type: InteractionType): string => {
  switch (type) {
    case InteractionType.HEART:
      return 'tim';
    case InteractionType.WAVE:
      return 'vẫy tay';
    case InteractionType.POKE:
      return 'chọc';
    case InteractionType.FIRE:
      return 'lửa';
    case InteractionType.STAR:
      return 'sao';
    case InteractionType.HUG:
      return 'ôm';
    default:
      return 'tương tác';
  }
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
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    padding: 20,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  friendUsername: {
    fontSize: 15,
    color: '#666',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  offlineText: {
    fontSize: 13,
    color: '#999',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  statusMessage: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  distanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  distanceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 15,
    color: '#1976D2',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  interactionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  interactionButton: {
    width: '30%',
    aspectRatio: 1,
    margin: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  interactionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  interactionLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
