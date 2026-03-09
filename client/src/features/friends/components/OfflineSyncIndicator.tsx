import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../../../shared/contexts/NetworkContext';
import { useLocationOfflineSync } from '../hooks/useLocationOfflineSync';

export const OfflineSyncIndicator: React.FC = () => {
  const { isConnected } = useNetwork();
  const { isSyncing, pendingCount } = useLocationOfflineSync();

  if (isConnected && pendingCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isConnected ? (
        <>
          <Ionicons name="cloud-offline" size={16} color="#FF9500" />
          <Text style={styles.offlineText}>Ngoại tuyến</Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </>
      ) : isSyncing ? (
        <>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.syncingText}>Đang đồng bộ...</Text>
        </>
      ) : pendingCount > 0 ? (
        <>
          <Ionicons name="cloud-upload-outline" size={16} color="#007AFF" />
          <Text style={styles.pendingText}>{pendingCount} đang chờ</Text>
        </>
      ) : (
        <>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.syncedText}>Đã đồng bộ</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  syncingText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  pendingText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  syncedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
