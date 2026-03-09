import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

interface ProfileActionsProps {
  onLogout: () => void;
  onClearToken?: () => void;
}

export function ProfileActions({ onLogout, onClearToken }: ProfileActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      {onClearToken && (
        <TouchableOpacity style={styles.clearButton} onPress={onClearToken}>
          <Text style={styles.clearText}>Xóa token cũ & Đăng xuất</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#95a5a6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
