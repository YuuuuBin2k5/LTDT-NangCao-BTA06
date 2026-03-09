import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { friendLocationService } from '../../../services/location/friend-location.service';
import { LocationHistoryEntry } from '../../../shared/types/location.types';
import { useToast } from '../../../shared/contexts/ToastContext';
import { formatDistanceToNow } from '../../../shared/utils/format.utils';

interface LocationHistoryScreenProps {
  onLocationSelect?: (location: LocationHistoryEntry) => void;
  onNavigateToMap?: (location: LocationHistoryEntry) => void;
}

export const LocationHistoryScreen: React.FC<LocationHistoryScreenProps> = ({
  onLocationSelect,
  onNavigateToMap,
}) => {
  const [history, setHistory] = useState<LocationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationHistoryEntry | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await friendLocationService.getLocationHistory(7);
      setHistory(data);
    } catch (error) {
      showToast('Không thể tải lịch sử vị trí', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Xóa lịch sử',
      'Bạn có chắc muốn xóa toàn bộ lịch sử vị trí?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendLocationService.clearLocationHistory();
              setHistory([]);
              showToast('Đã xóa lịch sử vị trí', 'success');
            } catch (error) {
              showToast('Không thể xóa lịch sử', 'error');
            }
          },
        },
      ]
    );
  };

  const handleLocationPress = (location: LocationHistoryEntry) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  const handleViewOnMap = (location: LocationHistoryEntry) => {
    onNavigateToMap?.(location);
  };

  const handleDeleteItem = (location: LocationHistoryEntry) => {
    Alert.alert(
      'Xóa vị trí',
      'Bạn có chắc muốn xóa vị trí này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setHistory((prev) => prev.filter((item) => item.id !== location.id));
            showToast('Đã xóa vị trí', 'success');
          },
        },
      ]
    );
  };

  const calculateDistance = (from: LocationHistoryEntry, to: LocationHistoryEntry): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const renderHistoryItem = ({ item, index }: { item: LocationHistoryEntry; index: number }) => {
    const distance =
      index < history.length - 1 ? calculateDistance(item, history[index + 1]) : null;

    return (
      <TouchableOpacity
        style={[
          styles.historyItem,
          selectedLocation?.id === item.id && styles.selectedItem,
        ]}
        onPress={() => handleLocationPress(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.timelineMarker}>
            <View style={styles.markerDot} />
            {index < history.length - 1 && <View style={styles.timelineLine} />}
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTime}>{formatDistanceToNow(item.timestamp)}</Text>
            <Text style={styles.itemCoords}>
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
            {item.address && <Text style={styles.itemAddress}>{item.address}</Text>}
            {distance !== null && (
              <Text style={styles.itemDistance}>
                <Ionicons name="walk" size={12} /> {distance.toFixed(2)} km
              </Text>
            )}
          </View>
        </View>

        {/* Mini map preview */}
        <View style={styles.mapPreview}>
          <MapView
            style={styles.miniMap}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: item.latitude,
              longitude: item.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
            />
          </MapView>
        </View>

        {/* Action buttons */}
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewOnMap(item)}
          >
            <Ionicons name="map-outline" size={18} color="#007AFF" />
            <Text style={styles.actionButtonText}>Xem trên bản đồ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteItem(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử vị trí (7 ngày)</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.clearButtonText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>Chưa có lịch sử vị trí</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden',
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  itemHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 12,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemTime: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCoords: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemDistance: {
    fontSize: 12,
    color: '#007AFF',
  },
  mapPreview: {
    height: 120,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  miniMap: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  itemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5EA',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});
