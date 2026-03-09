import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate?: () => void;
  onRecenter?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRotate,
  onRecenter,
}) => {
  return (
    <View style={styles.container}>
      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.controlButton} onPress={onZoomIn}>
          <Ionicons name="add" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.controlButton} onPress={onZoomOut}>
          <Ionicons name="remove" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Additional controls */}
      {(onRotate || onRecenter) && (
        <View style={styles.additionalControls}>
          {onRotate && (
            <TouchableOpacity style={styles.controlButton} onPress={onRotate}>
              <Ionicons name="compass-outline" size={24} color="#333" />
            </TouchableOpacity>
          )}
          {onRecenter && (
            <TouchableOpacity style={styles.controlButton} onPress={onRecenter}>
              <Ionicons name="locate" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
  },
  zoomControls: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  additionalControls: {
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
});
