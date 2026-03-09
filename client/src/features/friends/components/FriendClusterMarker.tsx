import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import type { FriendCluster } from '../../map/utils/clustering';

interface FriendClusterMarkerProps {
  cluster: FriendCluster;
  onPress: (cluster: FriendCluster) => void;
}

export const FriendClusterMarker: React.FC<FriendClusterMarkerProps> = ({
  cluster,
  onPress,
}) => {
  const handlePress = () => {
    onPress(cluster);
  };

  // Calculate size based on count
  const size = Math.min(60 + cluster.count * 2, 100);
  const fontSize = cluster.count > 99 ? 16 : cluster.count > 9 ? 18 : 20;

  return (
    <Marker
      coordinate={{
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      }}
      onPress={handlePress}
      tracksViewChanges={false}
    >
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={styles.circle}>
          <Text style={[styles.count, { fontSize }]}>{cluster.count}</Text>
          <Text style={styles.label}>bạn bè</Text>
        </View>
        
        {/* Online indicator if any friend is online */}
        {cluster.friends.some((f) => f.isOnline) && (
          <View style={styles.onlineIndicator} />
        )}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  count: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
