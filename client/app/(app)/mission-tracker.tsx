/**
 * Mission Tracker Screen — Theo dõi đơn hàng
 * Hiển thị missions đang active + lịch sử hoàn thành
 */
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useMissionTracker } from '../../src/features/missions/hooks/useMissionTracker';
import { STATUS_LABELS, STATUS_COLORS, MissionCartItem } from '../../src/features/missions/types/mission.types';

type Tab = 'active' | 'history';

export default function MissionTrackerScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const {
    tracker, history, isLoadingTracker, isLoadingHistory,
    updateStatus, cancelItem, isCancelling,
  } = useMissionTracker();

  const activeItems = tracker?.items.filter(
    i => !['CANCELLED', 'CANCEL_REQUESTED', 'COMPLETED'].includes(i.status)
  ) ?? [];

  const handleUpdateStatus = async (itemId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'IN_PROGRESS' : 'AT_LOCATION';
    try {
      await updateStatus({ itemId, status: nextStatus as any });
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    }
  };

  const handleCancel = (itemId: number) => {
    Alert.alert('Hủy nhiệm vụ', 'Bạn chắc chắn muốn hủy nhiệm vụ này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy nhiệm vụ', style: 'destructive',
        onPress: () => cancelItem(itemId).catch(e => Alert.alert('Lỗi', e.message)),
      },
    ]);
  };

  const StatusProgressBar = ({ status }: { status: string }) => {
    const steps = ['ACTIVE', 'IN_PROGRESS', 'AT_LOCATION', 'COMPLETED'];
    const currentIdx = steps.indexOf(status);
    return (
      <View style={styles.progressBar}>
        {steps.map((s, idx) => (
          <View key={s} style={styles.progressStep}>
            <View style={[styles.progressDot, idx <= currentIdx && styles.progressDotActive]} />
            {idx < steps.length - 1 && (
              <View style={[styles.progressLine, idx < currentIdx && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderActiveItem = ({ item }: { item: MissionCartItem }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.mission.title}</Text>
      <Text style={styles.cardMeta}>
        {item.mission.categoryIcon} {item.mission.placeName ?? item.mission.categoryName}
      </Text>

      {/* Progress bar */}
      <StatusProgressBar status={item.status} />

      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
        <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
          {STATUS_LABELS[item.status]}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        {/* Nút cập nhật trạng thái */}
        {(item.status === 'ACTIVE' || item.status === 'IN_PROGRESS') && (
          <TouchableOpacity
            style={styles.advanceBtn}
            onPress={() => handleUpdateStatus(item.id, item.status)}
          >
            <Text style={styles.advanceBtnText}>
              {item.status === 'ACTIVE' ? '🚶 Bắt đầu đi' : '📍 Đã đến nơi'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Nút check-in khi đến nơi */}
        {item.status === 'AT_LOCATION' && (
          <TouchableOpacity
            style={styles.checkInBtn}
            onPress={() => router.push({ pathname: '/mission-checkin', params: { itemId: String(item.id) } } as any)}
          >
            <Text style={styles.checkInBtnText}>📸 Check-in ngay</Text>
          </TouchableOpacity>
        )}

        {/* Nút hủy */}
        {!['COMPLETED', 'CANCELLED', 'CANCEL_REQUESTED'].includes(item.status) && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item.id)}
            disabled={isCancelling}
          >
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: MissionCartItem }) => (
    <View style={[styles.card, styles.historyCard]}>
      <View style={styles.historyLeft}>
        <Text style={styles.cardTitle}>{item.mission.title}</Text>
        <Text style={styles.cardMeta}>{item.mission.categoryIcon} {item.mission.categoryName}</Text>
        <Text style={styles.completedDate}>
          ✅ {item.completedAt
            ? new Date(item.completedAt).toLocaleDateString('vi-VN')
            : ''}
        </Text>
      </View>
      <View style={styles.xpEarned}>
        <Text style={styles.xpEarnedValue}>+{item.mission.xpReward}</Text>
        <Text style={styles.xpEarnedLabel}>XP</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📋 Theo Dõi</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Đang thực hiện ({activeItems.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch sử ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'active' ? (
        isLoadingTracker ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#3498db" />
        ) : (
          <FlatList
            data={activeItems}
            keyExtractor={item => String(item.id)}
            renderItem={renderActiveItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🎯</Text>
                <Text style={styles.emptyText}>Chưa có nhiệm vụ nào đang thực hiện</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.emptyLink}>Chọn missions →</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )
      ) : (
        isLoadingHistory ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#3498db" />
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => String(item.id)}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🏅</Text>
                <Text style={styles.emptyText}>Chưa hoàn thành mission nào</Text>
              </View>
            }
          />
        )
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
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#3498db' },
  tabText: { fontSize: 13, color: '#7f8c8d', fontWeight: '500' },
  tabTextActive: { color: '#3498db', fontWeight: '700' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  historyCard: { flexDirection: 'row', alignItems: 'center' },
  historyLeft: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#7f8c8d', marginBottom: 10 },
  completedDate: { fontSize: 12, color: '#2ecc71' },
  progressBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  progressStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e0e0e0' },
  progressDotActive: { backgroundColor: '#3498db' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#e0e0e0' },
  progressLineActive: { backgroundColor: '#3498db' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  advanceBtn: { backgroundColor: '#3498db', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  advanceBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  checkInBtn: { backgroundColor: '#2ecc71', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  checkInBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e74c3c' },
  cancelBtnText: { color: '#e74c3c', fontWeight: '600', fontSize: 13 },
  xpEarned: { alignItems: 'center', marginLeft: 12 },
  xpEarnedValue: { fontSize: 20, fontWeight: '900', color: '#f39c12' },
  xpEarnedLabel: { fontSize: 11, color: '#f39c12', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#7f8c8d', textAlign: 'center' },
  emptyLink: { color: '#3498db', fontWeight: '700', marginTop: 12, textDecorationLine: 'underline' },
});
