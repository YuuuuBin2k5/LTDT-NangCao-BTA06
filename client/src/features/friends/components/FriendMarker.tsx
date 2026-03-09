import React, { useMemo } from 'react';
import { Marker } from 'react-native-maps';
import { FriendLocation } from '../../../shared/types/location.types';
import { generateAvatarMarker } from '../utils/marker-image-generator';

interface FriendMarkerProps {
  friend: FriendLocation;
  onPress: (friend: FriendLocation) => void;
  animationEnabled?: boolean;
}

export const FriendMarker: React.FC<FriendMarkerProps> = ({
  friend,
  onPress,
}) => {
  const handlePress = () => {
    console.log('🎯 FriendMarker pressed:', friend.name);
    onPress(friend);
  };

  console.log('🗺️ FriendMarker rendering:', {
    name: friend.name,
    lat: friend.latitude,
    lng: friend.longitude,
    isOnline: friend.isOnline,
  });

  // Generate marker icon with fixed size (60px) - won't scale with zoom
  const markerIcon = useMemo(() => {
    return generateAvatarMarker(
      friend.avatarUrl,
      friend.userId,
      friend.isOnline,
      friend.name,
      60 // Fixed size in pixels
    );
  }, [friend.avatarUrl, friend.userId, friend.isOnline, friend.name]);

  return (
    <Marker
      coordinate={{
        latitude: friend.latitude,
        longitude: friend.longitude,
      }}
      onPress={handlePress}
      icon={markerIcon}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
      tracksViewChanges={false}
      title={friend.name}
      description={`${friend.isOnline ? '🟢 Online' : '🔴 Offline'}${friend.statusMessage ? ` - ${friend.statusMessage}` : ''}`}
    />
  );
};
