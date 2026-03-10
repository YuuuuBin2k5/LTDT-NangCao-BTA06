import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { FriendLocation } from '../../../shared/types/location.types';
import { AvatarWithFrame } from '../../../shared/components/AvatarWithFrame';

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

  return (
    <Marker
      coordinate={{
        latitude: friend.latitude,
        longitude: friend.longitude,
      }}
      onPress={handlePress}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
      tracksViewChanges={true} // Needed for custom view markers to render correctly
      title={friend.name}
      description={`${friend.isOnline ? '🟢 Online' : '🔴 Offline'}${friend.statusMessage ? ` - ${friend.statusMessage}` : ''}`}
    >
      <View style={styles.markerContainer}>
        <AvatarWithFrame
          uri={friend.avatarUrl}
          frame={friend.selectedFrame}
          size={50}
          showPadding={true}
        />
        <View 
          style={[
            styles.onlineIndicator, 
            { backgroundColor: friend.isOnline ? '#4CAF50' : '#FF5722' }
          ]} 
        />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
});
