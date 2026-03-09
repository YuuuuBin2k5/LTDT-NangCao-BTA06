/**
 * Mission Detail Screen — Chi tiết nhiệm vụ
 * Hiển thị thông tin đầy đủ + bản đồ + nút thêm vào hành trình
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { missionService } from '../../../src/features/missions/services/mission.service';
import { useMissionCartStore } from '../../../src/features/missions/store/missionCartStore';
import { DIFFICULTY_LABELS } from '../../../src/features/missions/types/mission.types';

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cart, addToCart, isLoading: cartLoading } = useMissionCartStore();

  const { data: mission, isLoading } = useQuery({
    queryKey: ['mission', id],
    queryFn: () => missionService.getMissionById(Number(id)),
    enabled: !!id,
  });

  const cartItemIds = cart?.items
    .filter(i => !['CANCELLED', 'CANCEL_REQUESTED'].includes(i.status))
    .map(i => i.mission.id) ?? [];

  const inCart = mission ? cartItemIds.includes(mission.id) : false;

  const handleAddToCart = async () => {
    if (!mission) return;
    try {
      await addToCart(mission.id);
      Alert.alert(
        '✅ Đã thêm vào hành trình!',
        `"${mission.title}" đã được thêm. Bạn có muốn xem giỏ hàng?`,
        [
          { text: 'Tiếp tục', style: 'cancel' },
          { text: 'Xem giỏ hàng', onPress: () => router.push('/mission-cart' as any) },
        ]
      );
    } catch (e: any) {
      Alert.alert('Lỗi', e.message ?? 'Không thể thêm vào hành trình');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!mission) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy nhiệm vụ</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const difficultyColors: Record<number, string> = {
    1: '#2ecc71', 2: '#f39c12', 3: '#e74c3c',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhiệm vụ</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: (mission.categoryColor ?? '#3498db') + '22' }]}>
          <Text style={styles.categoryIcon}>{mission.categoryIcon}</Text>
          <Text style={[styles.categoryLabel, { color: mission.categoryColor ?? '#3498db' }]}>
            {mission.categoryName}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{mission.title}</Text>

        {/* Description */}
        {mission.description && (
          <Text style={styles.description}>{mission.description}</Text>
        )}

        {/* Info cards grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoVal}>⚡ {mission.xpReward}</Text>
            <Text style={styles.infoLabel}>XP Thưởng</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={[styles.infoVal, { color: difficultyColors[mission.difficulty] }]}>
              {DIFFICULTY_LABELS[mission.difficulty]}
            </Text>
            <Text style={styles.infoLabel}>Độ khó</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoVal}>📍 {mission.radiusMeters}m</Text>
            <Text style={styles.infoLabel}>Phạm vi check-in</Text>
          </View>
          {mission.badgeName && (
            <View style={styles.infoCard}>
              <Text style={styles.infoVal}>🏅 {mission.badgeName}</Text>
              <Text style={styles.infoLabel}>Badge nhận được</Text>
            </View>
          )}
        </View>

        {/* Location info */}
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>📍 Địa điểm</Text>
          {mission.placeName && (
            <Text style={styles.locationName}>{mission.placeName}</Text>
          )}
          {mission.placeAddress && (
            <Text style={styles.locationAddress}>{mission.placeAddress}</Text>
          )}
          <Text style={styles.coordinates}>
            {mission.latitude.toFixed(5)}, {mission.longitude.toFixed(5)}
          </Text>
        </View>

        {/* Deadline */}
        {mission.deadline && (
          <View style={styles.deadlineCard}>
            <Text style={styles.deadlineText}>
              ⏰ Hạn chót: {new Date(mission.deadline).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}

        {/* How to complete */}
        <View style={styles.howTo}>
          <Text style={styles.howToTitle}>📋 Cách hoàn thành</Text>
          {['Thêm nhiệm vụ vào hành trình', 'Nhấn "Bắt đầu Hành Trình" ở giỏ hàng',
            'Di chuyển đến địa điểm trên bản đồ',
            `Khi đến nơi (trong ${mission.radiusMeters}m), nhấn Check-in`,
            'Chụp ảnh bằng camera (không bắt buộc)',
            `Nhận +${mission.xpReward} XP!`
          ].map((step, idx) => (
            <View key={idx} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addBtn, inCart && styles.addBtnInCart]}
          onPress={inCart ? () => router.push('/mission-cart' as any) : handleAddToCart}
          disabled={cartLoading}
        >
          {cartLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.addBtnText}>
                {inCart ? '🛒 Xem giỏ hàng' : '+ Thêm vào Hành Trình'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#7f8c8d', marginBottom: 12 },
  backLink: { color: '#3498db', fontSize: 15, fontWeight: '600' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center',
  },
  backText: { fontSize: 20, color: '#1a1a2e' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  content: { padding: 20 },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12,
  },
  categoryIcon: { fontSize: 16, marginRight: 6 },
  categoryLabel: { fontSize: 13, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a2e', lineHeight: 30, marginBottom: 12 },
  description: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 20 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  infoCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  infoVal: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  infoLabel: { fontSize: 11, color: '#7f8c8d' },
  locationCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  locationTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  locationName: { fontSize: 15, fontWeight: '600', color: '#3498db', marginBottom: 4 },
  locationAddress: { fontSize: 13, color: '#7f8c8d', marginBottom: 4 },
  coordinates: { fontSize: 11, color: '#bdc3c7', fontFamily: 'monospace' },
  deadlineCard: {
    backgroundColor: '#fff3cd', borderRadius: 12, padding: 12, marginBottom: 14,
  },
  deadlineText: { fontSize: 13, fontWeight: '600', color: '#856404' },
  howTo: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  howToTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 14 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 1,
  },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 8,
  },
  addBtn: {
    backgroundColor: '#1a1a2e', borderRadius: 16, padding: 18, alignItems: 'center',
    shadowColor: '#1a1a2e', shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  addBtnInCart: { backgroundColor: '#3498db' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
