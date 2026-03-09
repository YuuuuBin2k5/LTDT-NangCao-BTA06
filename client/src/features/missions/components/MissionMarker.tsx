import React, { memo } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Mission } from '../types/mission.types';

interface MissionMarkerProps {
  mission: Mission;
  onPress?: (mission: Mission) => void;
}

/**
 * Component hiển thị Marker cho Mission trên bản đồ
 */
const MissionMarkerComponent: React.FC<MissionMarkerProps> = ({ mission, onPress }) => {
  const router = useRouter();

  const handleMarkerPress = () => {
    if (onPress) {
      onPress(mission);
    }
  };

  const handleCalloutPress = () => {
    // Navigate to mission details screen
    router.push(`/mission/${mission.id}` as any);
  };

  return (
    <Marker
      coordinate={{
        latitude: mission.latitude,
        longitude: mission.longitude,
      }}
      pinColor={mission.categoryColor || '#f1c40f'}
      onPress={handleMarkerPress}
      identifier={`mission-${mission.id}`}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.markerIcon, { backgroundColor: mission.categoryColor || '#f1c40f' }]}>
          <Text style={styles.iconText}>{mission.categoryIcon || '🚩'}</Text>
        </View>
        <View style={styles.markerPointer} />
      </View>

      <Callout onPress={handleCalloutPress}>
        <View style={styles.calloutContainer}>
          <View style={styles.calloutHeader}>
            <Text style={styles.calloutIcon}>{mission.categoryIcon}</Text>
            <Text style={styles.calloutTitle}>{mission.title}</Text>
          </View>
          <Text style={styles.calloutReward}>⚡ {mission.xpReward} XP</Text>
          <Text style={styles.calloutDescription} numberOfLines={2}>
            {mission.description}
          </Text>
          <Text style={styles.calloutAction}>Chạm để xem chi tiết →</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#f1c40f',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconText: {
    fontSize: 18,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
  calloutContainer: {
    width: 220,
    padding: 12,
    backgroundColor: '#fff',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  calloutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1,
  },
  calloutReward: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f39c12',
    marginBottom: 6,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  calloutAction: {
    fontSize: 11,
    color: '#3498db',
    fontWeight: '600',
    textAlign: 'right',
  },
});

export const MissionMarker = memo(MissionMarkerComponent, (prevProps, nextProps) => {
  return prevProps.mission.id === nextProps.mission.id &&
         prevProps.onPress === nextProps.onPress;
});
