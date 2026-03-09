/**
 * Custom marker for posts on map
 * Shows thumbnail image and user avatar
 */
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Post } from '../types/post.types';

interface PostMarkerProps {
  post: Post;
  onPress: (post: Post) => void;
}

export const PostMarker: React.FC<PostMarkerProps> = ({ post, onPress }) => {
  const thumbnailUrl = post.images[0]?.thumbnailUrl;
  const avatarUrl = post.user.avatarUrl;

  return (
    <Marker
      coordinate={{
        latitude: post.latitude,
        longitude: post.longitude,
      }}
      onPress={() => onPress(post)}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        {thumbnailUrl ? (
          <Image 
            source={{ uri: thumbnailUrl }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <View style={styles.placeholderIcon} />
          </View>
        )}
        
        {avatarUrl && (
          <Image 
            source={{ uri: avatarUrl }} 
            style={styles.avatar}
            resizeMode="cover"
          />
        )}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  placeholderThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  placeholderIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#bdbdbd',
  },
  avatar: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
