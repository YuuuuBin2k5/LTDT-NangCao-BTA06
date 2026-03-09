import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { friendInteractionService } from '../../../services/interaction/friend-interaction.service';
import { InteractionStats, InteractionType } from '../../../shared/types/interaction.types';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';
import { useToast } from '../../../shared/contexts/ToastContext';
import { AchievementBadges, getDefaultAchievements } from '../components/AchievementBadges';

/**
 * InteractionStatsScreen - Display interaction statistics and history
 * Requirements: 11.1, 11.3, 11.4
 */
export const InteractionStatsScreen: React.FC = () => {
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await friendInteractionService.getStatistics();
      setStats(data);
    } catch (error) {
      showToast('Không thể tải thống kê', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có dữ liệu thống kê</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const interactionTypes = [
    { type: InteractionType.HEART, emoji: '❤️', label: 'Tim', sent: stats.heartsSent, received: stats.heartsReceived },
    { type: InteractionType.WAVE, emoji: '👋', label: 'Vẫy tay', sent: stats.wavesSent, received: stats.wavesReceived },
    { type: InteractionType.POKE, emoji: '👉', label: 'Chọc', sent: stats.pokesSent, received: stats.pokesReceived },
    { type: InteractionType.FIRE, emoji: '🔥', label: 'Lửa', sent: stats.firesSent || 0, received: stats.firesReceived || 0 },
    { type: InteractionType.STAR, emoji: '⭐', label: 'Sao', sent: stats.starsSent || 0, received: stats.starsReceived || 0 },
    { type: InteractionType.HUG, emoji: '🤗', label: 'Ôm', sent: stats.hugsSent || 0, received: stats.hugsReceived || 0 },
  ];

  // Get achievements based on stats
  const achievements = getDefaultAchievements({
    totalSent: stats.totalSent,
    heartsSent: stats.heartsSent,
    wavesSent: stats.wavesSent,
    pokesSent: stats.pokesSent,
    firesSent: stats.firesSent || 0,
    starsSent: stats.starsSent || 0,
    hugsSent: stats.hugsSent || 0,
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê tương tác</Text>
        <View style={styles.backButton} />
      </View>

      {/* Total Stats */}
      <View style={styles.totalSection}>
        <View style={styles.totalCard}>
          <Text style={styles.totalNumber}>{stats.totalSent}</Text>
          <Text style={styles.totalLabel}>Đã gửi</Text>
        </View>
        <View style={styles.totalCard}>
          <Text style={styles.totalNumber}>{stats.totalReceived}</Text>
          <Text style={styles.totalLabel}>Đã nhận</Text>
        </View>
      </View>

      {/* Breakdown by Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chi tiết theo loại</Text>
        <View style={styles.typeGrid}>
          {interactionTypes.map((item) => (
            <View key={item.type} style={styles.typeCard}>
              <Text style={styles.typeEmoji}>{item.emoji}</Text>
              <Text style={styles.typeLabel}>{item.label}</Text>
              <View style={styles.typeStats}>
                <View style={styles.typeStat}>
                  <Text style={styles.typeStatNumber}>{item.sent}</Text>
                  <Text style={styles.typeStatLabel}>Gửi</Text>
                </View>
                <View style={styles.typeDivider} />
                <View style={styles.typeStat}>
                  <Text style={styles.typeStatNumber}>{item.received}</Text>
                  <Text style={styles.typeStatLabel}>Nhận</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Best Friends */}
      {stats.bestFriends && stats.bestFriends.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bạn thân nhất</Text>
          <Text style={styles.sectionSubtitle}>
            Dựa trên số lượng tương tác
          </Text>
          {stats.bestFriends.map((friend, index) => (
            <View key={friend.friendId} style={styles.friendCard}>
              <View style={styles.friendRank}>
                <Text style={styles.friendRankText}>#{index + 1}</Text>
              </View>
              <OptimizedImage
                uri={friend.avatarUrl}
                style={styles.friendAvatar}
              />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendInteractions}>
                  {friend.interactionCount} tương tác
                </Text>
              </View>
              <View style={styles.friendBadge}>
                {index === 0 && <Text style={styles.friendBadgeEmoji}>🥇</Text>}
                {index === 1 && <Text style={styles.friendBadgeEmoji}>🥈</Text>}
                {index === 2 && <Text style={styles.friendBadgeEmoji}>🥉</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empty State for Best Friends */}
      {(!stats.bestFriends || stats.bestFriends.length === 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bạn thân nhất</Text>
          <View style={styles.emptyBestFriends}>
            <Text style={styles.emptyBestFriendsEmoji}>👥</Text>
            <Text style={styles.emptyBestFriendsText}>
              Chưa có dữ liệu bạn thân
            </Text>
            <Text style={styles.emptyBestFriendsSubtext}>
              Tương tác nhiều hơn với bạn bè để xem thống kê
            </Text>
          </View>
        </View>
      )}

      {/* Achievement Badges - Requirements: 11.2 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thành tựu</Text>
        <AchievementBadges achievements={achievements} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  totalCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  typeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  typeStat: {
    flex: 1,
    alignItems: 'center',
  },
  typeStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 2,
  },
  typeStatLabel: {
    fontSize: 11,
    color: '#999',
  },
  typeDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  friendRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  friendInteractions: {
    fontSize: 13,
    color: '#999',
  },
  friendBadge: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendBadgeEmoji: {
    fontSize: 28,
  },
  emptyBestFriends: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyBestFriendsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyBestFriendsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyBestFriendsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});