/**
 * PostClusterMarker - Marker component for clustered posts
 */
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import type { PostCluster } from '../../map/utils/clustering';

interface PostClusterMarkerProps {
  cluster: PostCluster;
  onPress: (cluster: PostCluster) => void;
}

export const PostClusterMarker: React.FC<PostClusterMarkerProps> = ({
  cluster,
  onPress,
}) => {
  // Get first 3 posts with images for preview
  const postsWithImages = cluster.posts
    .filter(post => post.images.length > 0)
    .slice(0, 3);

  return (
    <Marker
      coordinate={{
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      }}
      onPress={() => onPress(cluster)}
      tracksViewChanges={false}
    >
      <View style={styles.container}>
        {/* Image preview grid */}
        {postsWithImages.length > 0 && (
          <View style={styles.imageGrid}>
            {postsWithImages.map((post, index) => (
              <Image
                key={post.id}
                source={{ uri: post.images[0].thumbnailUrl }}
                style={[
                  styles.thumbnail,
                  index === 1 && styles.thumbnailMiddle,
                  index === 2 && styles.thumbnailRight,
                ]}
              />
            ))}
          </View>
        )}
        
        {/* Count badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cluster.count}</Text>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  imageGrid: {
    flexDirection: 'row',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  thumbnail: {
    width: 20,
    height: 60,
  },
  thumbnailMiddle: {
    marginLeft: -1,
  },
  thumbnailRight: {
    marginLeft: -1,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
