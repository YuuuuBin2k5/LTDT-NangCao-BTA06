import React, { memo } from 'react';
import { Marker } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { PlaceCluster } from '../utils/clustering';

interface ClusterMarkerProps {
  cluster: PlaceCluster;
  onPress?: (cluster: PlaceCluster) => void;
}

/**
 * ClusterMarker component for displaying a cluster of places on the map
 * Shows the number of places in the cluster
 * Memoized to prevent unnecessary re-renders
 */
const ClusterMarkerComponent: React.FC<ClusterMarkerProps> = ({
  cluster,
  onPress,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(cluster);
    }
  };

  // Get cluster size category for styling
  const getClusterSize = (count: number): 'small' | 'medium' | 'large' => {
    if (count < 10) return 'small';
    if (count < 50) return 'medium';
    return 'large';
  };

  const size = getClusterSize(cluster.count);

  return (
    <Marker
      coordinate={{
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      }}
      onPress={handlePress}
      identifier={cluster.id}
      tracksViewChanges={false}
    >
      <View style={[styles.clusterContainer, styles[size]]}>
        <Text style={[styles.clusterText, styles[`${size}Text`]]}>
          {cluster.count}
        </Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  clusterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    borderWidth: 2,
    borderColor: '#fff',
  },
  small: {
    width: 40,
    height: 40,
  },
  medium: {
    width: 50,
    height: 50,
  },
  large: {
    width: 60,
    height: 60,
  },
  clusterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

/**
 * Memoized ClusterMarker component
 * Only re-renders when cluster.id or cluster.count changes
 */
export const ClusterMarker = memo(ClusterMarkerComponent, (prevProps, nextProps) => {
  return prevProps.cluster.id === nextProps.cluster.id &&
         prevProps.cluster.count === nextProps.cluster.count &&
         prevProps.onPress === nextProps.onPress;
});
