import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

export type MapLayer = 'posts' | 'friends' | 'missions' | 'all';

interface MapLayerToggleProps {
  selectedLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
}

export const MapLayerToggle: React.FC<MapLayerToggleProps> = ({
  selectedLayer,
  onLayerChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.leftButton,
          selectedLayer === 'posts' && styles.activeButton,
        ]}
        onPress={() => onLayerChange('posts')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            selectedLayer === 'posts' && styles.activeButtonText,
          ]}
        >
          📍 Bài viết
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.middleButton,
          selectedLayer === 'friends' && styles.activeButton,
        ]}
        onPress={() => onLayerChange('friends')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            selectedLayer === 'friends' && styles.activeButtonText,
          ]}
        >
          👥 Bạn bè
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.middleButton,
          selectedLayer === 'missions' && styles.activeButton,
        ]}
        onPress={() => onLayerChange('missions')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            selectedLayer === 'missions' && styles.activeButtonText,
          ]}
        >
          🚩 Nhiệm vụ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.rightButton,
          selectedLayer === 'all' && styles.activeButton,
        ]}
        onPress={() => onLayerChange('all')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            selectedLayer === 'all' && styles.activeButtonText,
          ]}
        >
          🗺️ Tất cả
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  leftButton: {
    marginRight: 2,
  },
  middleButton: {
    marginHorizontal: 2,
  },
  rightButton: {
    marginLeft: 2,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeButtonText: {
    color: '#fff',
  },
});
