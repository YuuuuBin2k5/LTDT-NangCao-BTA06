/**
 * Mission Cart Screen — Giỏ hàng nhiệm vụ
 * = Màn hình "Thanh toán" / Xem lại và bắt đầu hành trình
 */
import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useMissionCartStore } from '../../src/features/missions/store/missionCartStore';
import { STATUS_LABELS, STATUS_COLORS } from '../../src/features/missions/types/mission.types';

export default function MissionCartScreen() {
  const { cart, isLoading, error, fetchCart, removeFromCart, startJourney } = useMissionCartStore();

  useEffect(() => { fetchCart(); }, []);

  const activeItems = cart?.items.filter(
    i => !['CANCELLED', 'CANCEL_REQUESTED'].includes(i.status)
  ) ?? [];

  const handleStart = async () => {
    Alert.alert(
      '🚀 Bắt đầu Hành Trình',
      `Bạn có ${activeItems.length} nhiệm vụ với tổng ${cart?.totalXpPossible ?? 0} XP. Xác nhận bắt đầu?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bắt đầu!', onPress: async () => {
            try {
              await startJourney();
              router.replace('/(app)/(tabs)' as any);
            } catch (e: any) {
              Alert.alert('Lỗi', e.message ?? 'Không thể bắt đầu hành trình');
            }
          }
        },
      ]
    );
  };

  const handleRemove = (itemId: number, title: string) => {
    Alert.alert('Xóa nhiệm vụ', `Xóa "${title}" khỏi hành trình?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => removeFromCart(itemId) },
    ]);
  };

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#3498db" />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🛒 Hành Trình</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Cart status (đang ACTIVE) */}
      {cart?.status === 'ACTIVE' && (
        <View style={styles.activeBanner}>
          <Text style={styles.activeBannerText}>✅ Hành trình đang diễn ra!</Text>
          <TouchableOpacity onPress={() => router.replace('/mission-tracker' as any)}>
            <Text style={styles.activeBannerLink}>Xem tracker →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Total XP summary */}
      {activeItems.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {activeItems.length} nhiệm vụ đã chọn
          </Text>
          <Text style={styles.summaryXp}>
            ⚡ Tổng {cart?.totalXpPossible ?? 0} XP
          </Text>
        </View>
      )}

      {/* Cart items */}
      <FlatList
        data={activeItems}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{item.mission.title}</Text>
              <Text style={styles.cardMeta}>
                {item.mission.categoryIcon} {item.mission.categoryName}
                {'  '}⚡ {item.mission.xpReward} XP
              </Text>
              {item.mission.placeName && (
                <Text style={styles.cardPlace}>📍 {item.mission.placeName}</Text>
              )}
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
            {cart?.status === 'PENDING' && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.id, item.mission.title)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyText}>Hành trình trống</Text>
            <Text style={styles.emptySubText}>Thêm missions từ tab Nhiệm Vụ</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.back()}>
              <Text style={styles.browseBtnText}>Khám phá missions</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Checkout button */}
      {activeItems.length > 0 && cart?.status === 'PENDING' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStart}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.startBtnText}>🚀 Bắt Đầu Hành Trình</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  backBtn: { padding: 4 },
  backText: { color: '#3498db', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  activeBanner: {
    backgroundColor: '#d5f5e3', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12, paddingHorizontal: 20,
  },
  activeBannerText: { color: '#27ae60', fontWeight: '600' },
  activeBannerLink: { color: '#27ae60', fontWeight: '700', textDecorationLine: 'underline' },
  summary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  summaryText: { fontSize: 14, color: '#7f8c8d' },
  summaryXp: { fontSize: 16, fontWeight: '700', color: '#f39c12' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#7f8c8d', marginBottom: 4 },
  cardPlace: { fontSize: 12, color: '#3498db', marginBottom: 6 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  removeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#ffeaea', justifyContent: 'center', alignItems: 'center', marginLeft: 12,
  },
  removeBtnText: { color: '#e74c3c', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  emptySubText: { fontSize: 13, color: '#7f8c8d', marginBottom: 20 },
  browseBtn: { backgroundColor: '#3498db', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  browseBtnText: { color: '#fff', fontWeight: '700' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  startBtn: {
    backgroundColor: '#1a1a2e', borderRadius: 16, padding: 18, alignItems: 'center',
    shadowColor: '#1a1a2e', shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
