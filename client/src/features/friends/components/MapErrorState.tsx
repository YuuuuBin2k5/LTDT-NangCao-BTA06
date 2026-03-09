import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  type?: 'network' | 'permission' | 'general';
}

export const MapErrorState: React.FC<MapErrorStateProps> = ({
  error,
  onRetry,
  type = 'general',
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: 'cloud-offline-outline' as const,
          title: 'Không có kết nối',
          message: 'Vui lòng kiểm tra kết nối mạng và thử lại',
        };
      case 'permission':
        return {
          icon: 'location-outline' as const,
          title: 'Cần quyền truy cập vị trí',
          message: 'Vui lòng cấp quyền truy cập vị trí trong cài đặt',
        };
      default:
        return {
          icon: 'alert-circle-outline' as const,
          title: 'Đã xảy ra lỗi',
          message: typeof error === 'string' ? error : error.message,
        };
    }
  };

  const config = getErrorConfig();

  return (
    <View style={styles.container}>
      <Ionicons name={config.icon} size={64} color="#999" />
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
