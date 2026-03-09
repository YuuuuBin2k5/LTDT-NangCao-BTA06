/**
 * Mission Check-in Screen — GPS verify + chụp ảnh
 * Sử dụng expo-image-picker (đã có sẵn trong Expo)
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useMissionTracker } from '../../src/features/missions/hooks/useMissionTracker';

const toRad = (d: number) => (d * Math.PI) / 180;

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MissionCheckInScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { tracker, checkIn, isCheckingIn } = useMissionTracker();

  const [gpsStatus, setGpsStatus] = useState<'checking' | 'ok' | 'far' | 'error'>('checking');
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const item = tracker?.items.find(i => String(i.id) === itemId);
  const mission = item?.mission;

  useEffect(() => { checkGPS(); }, [mission]);

  const checkGPS = async () => {
    if (!mission) return;
    setGpsStatus('checking');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setGpsStatus('error'); return; }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      setCurrentLocation({ lat, lng });

      const dist = haversineMeters(lat, lng, mission.latitude, mission.longitude);
      setDistanceM(Math.round(dist));
      setGpsStatus(dist <= mission.radiusMeters ? 'ok' : 'far');
    } catch {
      setGpsStatus('error');
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!currentLocation) return;
    try {
      await checkIn({
        itemId: Number(itemId),
        req: {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          photoUrl: photoUri ?? undefined,
        },
      });
      Alert.alert(
        '🎉 Check-in thành công!',
        `Bạn nhận được +${mission?.xpReward ?? 0} XP!`,
        [{ text: 'Tuyệt!', onPress: () => router.replace('/mission-tracker' as any) }]
      );
    } catch (e: any) {
      Alert.alert('Check-in thất bại', e.message ?? 'Lỗi không xác định');
    }
  };

  if (!mission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 10, color: '#7f8c8d' }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📸 Check-in</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Mission info */}
      <View style={styles.missionInfo}>
        <Text style={styles.missionTitle}>{mission.title}</Text>
        <Text style={styles.missionPlace}>📍 {mission.placeName ?? 'Địa điểm nhiệm vụ'}</Text>
        <Text style={styles.missionReward}>⚡ +{mission.xpReward} XP khi hoàn thành</Text>
      </View>

      {/* GPS Status Card */}
      <View style={[styles.gpsCard, {
        backgroundColor:
          gpsStatus === 'ok' ? '#d5f5e3' :
          gpsStatus === 'far' ? '#fdecea' : '#fff3cd',
      }]}>
        {gpsStatus === 'checking' && (
          <View style={styles.row}>
            <ActivityIndicator size="small" color="#f39c12" />
            <Text style={[styles.gpsText, { marginLeft: 8 }]}>Đang kiểm tra vị trí...</Text>
          </View>
        )}
        {gpsStatus === 'ok' && (
          <Text style={[styles.gpsText, { color: '#27ae60' }]}>
            ✅ Bạn đang trong phạm vi check-in! ({distanceM}m)
          </Text>
        )}
        {gpsStatus === 'far' && (
          <View>
            <Text style={[styles.gpsText, { color: '#e74c3c' }]}>
              ❌ Bạn cách địa điểm ~{distanceM}m
            </Text>
            <Text style={styles.gpsSubText}>Cần trong phạm vi {mission.radiusMeters}m</Text>
            <TouchableOpacity onPress={checkGPS} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Thử lại GPS</Text>
            </TouchableOpacity>
          </View>
        )}
        {gpsStatus === 'error' && (
          <Text style={[styles.gpsText, { color: '#e74c3c' }]}>
            ⚠️ Không thể lấy vị trí. Hãy bật GPS.
          </Text>
        )}
      </View>

      {/* Photo section */}
      {gpsStatus === 'ok' && (
        <View style={styles.photoSection}>
          {photoUri ? (
            <View>
              <Image source={{ uri: photoUri }} style={styles.preview} />
              <TouchableOpacity style={styles.retakeBtn} onPress={pickPhoto}>
                <Text style={styles.retakeBtnText}>🔄 Chụp lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
              <Text style={styles.photoBtnIcon}>📷</Text>
              <Text style={styles.photoBtnText}>Chụp ảnh check-in</Text>
              <Text style={styles.photoBtnSub}>(Không bắt buộc)</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Submit button */}
      {gpsStatus === 'ok' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, isCheckingIn && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isCheckingIn}
          >
            {isCheckingIn
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>🎉 Xác nhận Check-in</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  backText: { color: '#3498db', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  missionInfo: {
    backgroundColor: '#fff', padding: 20, margin: 16, borderRadius: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  missionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  missionPlace: { fontSize: 13, color: '#3498db', marginBottom: 4 },
  missionReward: { fontSize: 13, color: '#f39c12', fontWeight: '600' },
  gpsCard: { padding: 16, marginHorizontal: 16, borderRadius: 12, marginBottom: 16 },
  gpsText: { fontSize: 14, fontWeight: '600' },
  gpsSubText: { fontSize: 12, color: '#e74c3c', marginTop: 4 },
  retryBtn: {
    marginTop: 8, backgroundColor: '#e74c3c', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start',
  },
  retryBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  photoSection: { marginHorizontal: 16 },
  photoBtn: {
    backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed',
  },
  photoBtnIcon: { fontSize: 40, marginBottom: 8 },
  photoBtnText: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  photoBtnSub: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  preview: { width: '100%', height: 220, borderRadius: 14 },
  retakeBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'center', marginTop: 8,
  },
  retakeBtnText: { color: '#fff', fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36 },
  submitBtn: {
    backgroundColor: '#2ecc71', borderRadius: 16, padding: 18, alignItems: 'center',
    shadowColor: '#2ecc71', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  submitBtnDisabled: { backgroundColor: '#95a5a6' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
