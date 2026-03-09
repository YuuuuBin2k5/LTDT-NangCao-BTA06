import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { MissionCartItem, STATUS_LABELS, STATUS_COLORS } from '../types/mission.types';

interface ActiveMissionsOverlayProps {
  activeItems: MissionCartItem[];
  onFocusMission?: (item: MissionCartItem) => void;
  containerStyle?: any;
}

const { width } = Dimensions.get('window');

/**
 * Component hiển thị các nhiệm vụ đang thực hiện ngay trên bản đồ Home
 */
export const ActiveMissionsOverlay: React.FC<ActiveMissionsOverlayProps> = ({
  activeItems,
  onFocusMission,
  containerStyle,
}) => {
  if (activeItems.length === 0) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏃 Nhiệm vụ đang thực hiện ({activeItems.length})</Text>
        <TouchableOpacity onPress={() => router.push('/mission-tracker' as any)}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={width * 0.75 + 12}
        decelerationRate="fast"
      >
        {activeItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onFocusMission?.(item)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
              </View>
              <Text style={styles.xpText}>⚡ {item.mission.xpReward} XP</Text>
            </View>

            <Text style={styles.missionTitle} numberOfLines={1}>
              {item.mission.title}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.locationText} numberOfLines={1}>
                📍 {item.mission.placeName || 'Địa điểm nhiệm vụ'}
              </Text>
              <TouchableOpacity
                style={styles.checkInBtn}
                onPress={() => router.push({
                  pathname: '/mission-checkin',
                  params: { itemId: item.id }
                } as any)}
              >
                <Text style={styles.checkInBtnText}>Check-in</Text>
              </TouchableOpacity>
            </View>

            {/* Progress bar (simplified status) */}
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: item.status === 'COMPLETED' ? '100%' : 
                           item.status === 'AT_LOCATION' ? '80%' :
                           item.status === 'IN_PROGRESS' ? '50%' : '20%',
                    backgroundColor: STATUS_COLORS[item.status]
                  }
                ]} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120, // Trên các nút điều hướng và carousel posts
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  viewAll: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    width: width * 0.75,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f39c12',
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#7f8c8d',
    flex: 1,
    marginRight: 8,
  },
  checkInBtn: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  checkInBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
