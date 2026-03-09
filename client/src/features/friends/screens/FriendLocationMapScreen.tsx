import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { FriendLocationMapView } from '../components/FriendLocationMapView';
import { AvatarFrameSelector } from '../components/AvatarFrameSelector';
import { LocationPrivacySettings } from '../components/LocationPrivacySettings';
import { FriendDetailsBottomSheet } from '../components/FriendDetailsBottomSheet';
import { StatusInputDialog } from '../components/StatusInputDialog';
import { FriendLocation, PrivacyMode } from '../../../shared/types/location.types';
import { useLocation } from '../../../store/contexts/LocationContext';
import { useLocationPrivacy } from '../hooks/useLocationPrivacy';
import { locationService } from '../../../services/location/location.service';

export const FriendLocationMapScreen: React.FC = () => {
  const { currentLocation } = useLocation();
  const { privacyMode, loadPrivacySettings } = useLocationPrivacy();
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendLocation | null>(null);
  const [currentStatus, setCurrentStatus] = useState<{ message: string; emoji: string }>({ message: '', emoji: '' });

  useEffect(() => {
    loadPrivacySettings();
  }, [loadPrivacySettings]);

  const handleFriendPress = useCallback((friend: FriendLocation) => {
    setSelectedFriend(friend);
  }, []);

  const handleOwnMarkerPress = useCallback(() => {
    setShowStatusDialog(true);
  }, []);

  const handleStatusSave = useCallback(async (status: string, emoji?: string) => {
    try {
      // Update status on server
      if (currentLocation) {
        await locationService.updateLocation(currentLocation, {
          privacyMode,
          statusMessage: status || undefined,
          statusEmoji: emoji || undefined,
        });
        
        // Update local state
        setCurrentStatus({ message: status, emoji: emoji || '' });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }, [currentLocation, privacyMode]);

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : undefined;

  const currentLocationCoords = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <FriendLocationMapView
        initialRegion={initialRegion}
        currentLocation={currentLocationCoords}
        onFriendPress={handleFriendPress}
        onOwnMarkerPress={handleOwnMarkerPress}
        currentStatus={currentStatus}
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        {/* Privacy Mode Indicator */}
        <TouchableOpacity
          style={[
            styles.privacyButton,
            privacyMode === PrivacyMode.GHOST_MODE && styles.privacyButtonGhost,
          ]}
          onPress={() => setShowPrivacySettings(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.privacyIcon}>
            {privacyMode === PrivacyMode.GHOST_MODE
              ? '👻'
              : privacyMode === PrivacyMode.CLOSE_FRIENDS
              ? '⭐'
              : '👥'}
          </Text>
          <Text style={styles.privacyText}>
            {privacyMode === PrivacyMode.GHOST_MODE
              ? 'Ẩn danh'
              : privacyMode === PrivacyMode.CLOSE_FRIENDS
              ? 'Bạn thân'
              : 'Tất cả'}
          </Text>
        </TouchableOpacity>

        {/* Avatar Frame Button */}
        <TouchableOpacity
          style={styles.frameButton}
          onPress={() => setShowFrameSelector(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.frameIcon}>🖼️</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AvatarFrameSelector
        visible={showFrameSelector}
        onClose={() => setShowFrameSelector(false)}
      />

      <LocationPrivacySettings
        visible={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
      />

      <StatusInputDialog
        visible={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onSave={handleStatusSave}
        currentStatus={currentStatus.message}
        currentEmoji={currentStatus.emoji}
      />

      <FriendDetailsBottomSheet
        visible={selectedFriend !== null}
        friend={selectedFriend}
        currentLocation={currentLocationCoords}
        onClose={() => setSelectedFriend(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  privacyButtonGhost: {
    backgroundColor: '#9C27B0',
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  privacyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  frameButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  frameIcon: {
    fontSize: 24,
  },
});
