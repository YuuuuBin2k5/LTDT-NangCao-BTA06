import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface MapWarningBannerProps {
  message: string;
}

export const MapWarningBanner: React.FC<MapWarningBannerProps> = ({ message }) => {
  return (
    <View style={styles.warningBanner}>
      <Text style={styles.warningText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  warningBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#ff9800',
    padding: 15,
    borderRadius: 10,
    zIndex: 1000,
  },
  warningText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
