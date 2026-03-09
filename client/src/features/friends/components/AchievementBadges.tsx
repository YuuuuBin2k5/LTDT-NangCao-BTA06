import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

/**
 * Achievement type definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
}

/**
 * AchievementBadges - Display unlocked achievements and progress
 * Requirements: 11.2
 */
export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  achievements,
}) => {
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  return (
    <View style={styles.container}>
      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Thành tựu đã mở ({unlockedAchievements.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeScroll}
          >
            {unlockedAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.badgeCard}>
                <View style={styles.badgeIconContainer}>
                  <Text style={styles.badgeEmoji}>{achievement.emoji}</Text>
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedIcon}>✓</Text>
                  </View>
                </View>
                <Text style={styles.badgeName} numberOfLines={1}>
                  {achievement.name}
                </Text>
                <Text style={styles.badgeDescription} numberOfLines={2}>
                  {achievement.description}
                </Text>
                {achievement.unlockedAt && (
                  <Text style={styles.badgeDate}>
                    {formatDate(achievement.unlockedAt)}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Locked Achievements with Progress */}
      {lockedAchievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Thành tựu chưa mở ({lockedAchievements.length})
          </Text>
          {lockedAchievements.map((achievement) => (
            <View key={achievement.id} style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressIconContainer}>
                  <Text style={styles.progressEmoji}>{achievement.emoji}</Text>
                  <View style={styles.lockedOverlay} />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressName}>{achievement.name}</Text>
                  <Text style={styles.progressDescription} numberOfLines={2}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          (achievement.progress / achievement.requirement) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {achievement.progress} / {achievement.requirement}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyText}>Chưa có thành tựu</Text>
          <Text style={styles.emptySubtext}>
            Tương tác với bạn bè để mở khóa thành tựu
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Format date for display
 */
const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Hôm nay';
  } else if (days === 1) {
    return 'Hôm qua';
  } else if (days < 7) {
    return `${days} ngày trước`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} tuần trước`;
  } else {
    const months = Math.floor(days / 30);
    return `${months} tháng trước`;
  }
};

/**
 * Get predefined achievements
 * Requirements: 11.2
 */
export const getDefaultAchievements = (stats: {
  totalSent: number;
  heartsSent: number;
  wavesSent: number;
  pokesSent: number;
  firesSent: number;
  starsSent: number;
  hugsSent: number;
}): Achievement[] => {
  return [
    {
      id: 'first_interaction',
      name: 'Bước đầu tiên',
      description: 'Gửi tương tác đầu tiên',
      emoji: '🎉',
      requirement: 1,
      progress: stats.totalSent,
      unlocked: stats.totalSent >= 1,
      unlockedAt: stats.totalSent >= 1 ? new Date() : undefined,
    },
    {
      id: 'social_butterfly',
      name: 'Bướm xã hội',
      description: 'Gửi 50 tương tác',
      emoji: '🦋',
      requirement: 50,
      progress: stats.totalSent,
      unlocked: stats.totalSent >= 50,
      unlockedAt: stats.totalSent >= 50 ? new Date() : undefined,
    },
    {
      id: 'interaction_master',
      name: 'Bậc thầy tương tác',
      description: 'Gửi 100 tương tác',
      emoji: '👑',
      requirement: 100,
      progress: stats.totalSent,
      unlocked: stats.totalSent >= 100,
      unlockedAt: stats.totalSent >= 100 ? new Date() : undefined,
    },
    {
      id: 'heart_sender',
      name: 'Người gửi tim',
      description: 'Gửi 50 tim',
      emoji: '💝',
      requirement: 50,
      progress: stats.heartsSent,
      unlocked: stats.heartsSent >= 50,
      unlockedAt: stats.heartsSent >= 50 ? new Date() : undefined,
    },
    {
      id: 'wave_master',
      name: 'Chuyên gia vẫy tay',
      description: 'Vẫy tay 30 lần',
      emoji: '👋',
      requirement: 30,
      progress: stats.wavesSent,
      unlocked: stats.wavesSent >= 30,
      unlockedAt: stats.wavesSent >= 30 ? new Date() : undefined,
    },
    {
      id: 'poke_champion',
      name: 'Nhà vô địch chọc',
      description: 'Chọc bạn bè 40 lần',
      emoji: '👉',
      requirement: 40,
      progress: stats.pokesSent,
      unlocked: stats.pokesSent >= 40,
      unlockedAt: stats.pokesSent >= 40 ? new Date() : undefined,
    },
    {
      id: 'fire_starter',
      name: 'Người khơi lửa',
      description: 'Gửi 25 lửa',
      emoji: '🔥',
      requirement: 25,
      progress: stats.firesSent,
      unlocked: stats.firesSent >= 25,
      unlockedAt: stats.firesSent >= 25 ? new Date() : undefined,
    },
    {
      id: 'star_collector',
      name: 'Người thu thập sao',
      description: 'Gửi 35 sao',
      emoji: '⭐',
      requirement: 35,
      progress: stats.starsSent,
      unlocked: stats.starsSent >= 35,
      unlockedAt: stats.starsSent >= 35 ? new Date() : undefined,
    },
    {
      id: 'hug_expert',
      name: 'Chuyên gia ôm',
      description: 'Ôm bạn bè 20 lần',
      emoji: '🤗',
      requirement: 20,
      progress: stats.hugsSent,
      unlocked: stats.hugsSent >= 20,
      unlockedAt: stats.hugsSent >= 20 ? new Date() : undefined,
    },
    {
      id: 'legendary',
      name: 'Huyền thoại',
      description: 'Gửi 500 tương tác',
      emoji: '🌟',
      requirement: 500,
      progress: stats.totalSent,
      unlocked: stats.totalSent >= 500,
      unlockedAt: stats.totalSent >= 500 ? new Date() : undefined,
    },
  ];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  badgeScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  badgeCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  badgeEmoji: {
    fontSize: 48,
  },
  unlockedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unlockedIcon: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDate: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  progressIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  progressEmoji: {
    fontSize: 40,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  progressInfo: {
    flex: 1,
  },
  progressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  progressDescription: {
    fontSize: 13,
    color: '#666',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 60,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
