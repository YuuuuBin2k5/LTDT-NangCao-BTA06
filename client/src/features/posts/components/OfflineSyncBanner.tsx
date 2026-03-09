/**
 * Banner showing offline sync status
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useNetwork } from '../../../shared/contexts/NetworkContext';

export const OfflineSyncBanner: React.FC = () => {
  const { queueSize, isSyncing, sync } = useOfflineSync();
  const { isConnected, isInternetReachable } = useNetwork();

  const isOnline = isConnected && (isInternetReachable === null || isInternetReachable);

  // Don't show banner if no queued posts
  if (queueSize === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>
          {isSyncing
            ? '⏳ Đang đồng bộ...'
            : isOnline
            ? `📤 ${queueSize} bài đăng chờ đồng bộ`
            : `📵 ${queueSize} bài đăng chờ kết nối`}
        </Text>
        {isOnline && !isSyncing && (
          <TouchableOpacity onPress={sync} style={styles.button}>
            <Text style={styles.buttonText}>Đồng bộ ngay</Text>
          </TouchableOpacity>
        )}
        {isSyncing && <ActivityIndicator color="#fff" size="small" />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
