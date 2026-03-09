/**
 * Màn hình danh sách Missions — Tab chính
 * Tính năng: Lazy load (infinite scroll) + filter theo category
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useMissions } from '../../../src/features/missions/hooks/useMissions';
import { useMissionCartStore } from '../../../src/features/missions/store/missionCartStore';
import { useUserXp } from '../../../src/features/missions/hooks/useMissionTracker';
import type { Mission } from '../../../src/features/missions/types/mission.types';
import { DIFFICULTY_LABELS } from '../../../src/features/missions/types/mission.types';

const CATEGORIES = [
  { id: undefined, label: '🌍 Tất cả' },
  { id: 1, label: '🍜 Ẩm thực' },
  { id: 2, label: '🏛️ Văn hóa' },
  { id: 3, label: '🌿 Thiên nhiên' },
  { id: 4, label: '🎉 Giải trí' },
];

export default function MissionsScreen() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const { cart, addToCart, isLoading: cartLoading } = useMissionCartStore();
  const { data: xpData } = useUserXp();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
    useMissions({ categoryId: selectedCategoryId });

  const missions = (data?.pages.flatMap(p => p.content) ?? []).filter(Boolean) as Mission[];
  const cartItemIds = cart?.items
    .filter(i => !['CANCELLED', 'CANCEL_REQUESTED'].includes(i.status))
    .map(i => i.mission.id) ?? [];

  const handleAddToCart = useCallback(async (missionId: number) => {
    try {
      await addToCart(missionId);
    } catch (e: any) {
      alert(e.message ?? 'Lỗi khi thêm vào hành trình');
    }
  }, [addToCart]);

  const renderMissionCard = ({ item }: { item: Mission }) => {
    const inCart = cartItemIds.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/mission/${item.id}` as any)}
        activeOpacity={0.85}
      >
        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: item.categoryColor + '22' }]}>
          <Text style={styles.categoryIcon}>{item.categoryIcon}</Text>
          <Text style={[styles.categoryLabel, { color: item.categoryColor }]}>{item.categoryName}</Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        {item.placeName && (
          <Text style={styles.place}>📍 {item.placeName}</Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.tags}>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>⚡ {item.xpReward} XP</Text>
            </View>
            <Text style={styles.difficulty}>{DIFFICULTY_LABELS[item.difficulty]}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() => router.push({
                pathname: '/(app)/(tabs)',
                params: { 
                  focusMissionId: item.id,
                  lat: item.latitude,
                  lng: item.longitude
                }
              } as any)}
            >
              <Text style={styles.mapBtnText}>📍 Bản đồ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addBtn, inCart && styles.addBtnDisabled]}
              onPress={() => !inCart && handleAddToCart(item.id)}
              disabled={inCart || cartLoading}
            >
              <Text style={styles.addBtnText}>
                {inCart ? '✓ Đã thêm' : '+ Thêm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🎯 Nhiệm Vụ</Text>
          <Text style={styles.headerSub}>Khám phá thành phố & nhận XP</Text>
        </View>
        <View style={styles.headerRight}>
          {xpData && (
            <View style={styles.xpInfo}>
              <Text style={styles.levelText}>Lv.{xpData.level}</Text>
              <Text style={styles.xpInfoText}>⚡{xpData.totalXp}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => router.push('/mission-cart' as any)}
          >
            <Text style={styles.cartBtnText}>🛒 {cart?.items.length ?? 0}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category filter chips */}
      <View style={styles.filterBarContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={String(cat.id)}
              style={[
                styles.chip,
                selectedCategoryId === cat.id && styles.chipActive,
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Missions list — Lazy load */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#3498db" />
      ) : (
        <FlatList
          data={missions}
          keyExtractor={item => String(item.id)}
          renderItem={renderMissionCard}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          ListFooterComponent={isFetchingNextPage
            ? <ActivityIndicator style={{ margin: 16 }} color="#3498db" />
            : null}
          ListEmptyComponent={
            <Text style={styles.empty}>Không có nhiệm vụ nào. Thử đổi bộ lọc!</Text>
          }
        />
      )}

      {/* FAB: Xem tracker */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/mission-tracker' as any)}
      >
        <Text style={styles.fabText}>📋 Theo dõi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  headerSub: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpInfo: { alignItems: 'center' },
  levelText: { fontSize: 11, fontWeight: '700', color: '#3498db' },
  xpInfoText: { fontSize: 13, fontWeight: '600', color: '#f39c12' },
  cartBtn: {
    backgroundColor: '#3498db', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  cartBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  filterBarContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterBar: { 
    height: 50, 
  },
  filterBarContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chip: {
    height: 34,
    paddingHorizontal: 16, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    backgroundColor: '#f5f5f5', 
    marginRight: 8,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chipActive: { 
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  categoryBadge: {
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingHorizontal: 10, 
    height: 24,
    borderRadius: 12, 
    marginBottom: 8,
  },
  categoryIcon: { fontSize: 13, marginRight: 4 },
  categoryLabel: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  description: { fontSize: 13, color: '#7f8c8d', lineHeight: 18, marginBottom: 8 },
  place: { fontSize: 12, color: '#3498db', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tags: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  xpBadge: {
    backgroundColor: '#fff3cd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  xpText: { fontSize: 12, fontWeight: '700', color: '#f39c12' },
  difficulty: { fontSize: 12, color: '#7f8c8d' },
  addBtn: {
    backgroundColor: '#3498db', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  addBtnDisabled: { backgroundColor: '#2ecc71' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  mapBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  mapBtnText: { color: '#3498db', fontWeight: '600', fontSize: 13 },
  loader: { marginTop: 40 },
  empty: { textAlign: 'center', color: '#bdc3c7', marginTop: 40, fontSize: 14 },
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    backgroundColor: '#1a1a2e', borderRadius: 28, paddingHorizontal: 20, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
