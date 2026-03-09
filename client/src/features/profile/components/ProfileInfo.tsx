import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { UserProfile } from '../types';

interface ProfileInfoProps {
  profile: UserProfile | null;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Không có thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Username:</Text>
        <Text style={styles.value}>{profile.username}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Nickname:</Text>
        <Text style={styles.value}>{profile.nickName}</Text>
      </View>
      {profile.email && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
      )}
      {profile.bio && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Bio:</Text>
          <Text style={styles.value}>{profile.bio}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    width: 100,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
