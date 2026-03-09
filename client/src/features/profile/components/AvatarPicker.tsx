import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PRESET_AVATARS } from '../../../shared/constants/avatar.constants';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';

interface AvatarPickerProps {
  currentAvatar?: string;
  onSelect: (avatarUrl: string) => void;
  onUpload?: (imageUri: string) => Promise<string>;
}

const { width } = Dimensions.get('window');
const AVATAR_SIZE = (width - 80) / 4;

export function AvatarPicker({ currentAvatar, onSelect, onUpload }: AvatarPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập',
        'Cần quyền truy cập thư viện ảnh để chọn avatar'
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        if (onUpload) {
          setUploading(true);
          try {
            const uploadedUrl = await onUpload(imageUri);
            setSelectedAvatar(uploadedUrl);
            Alert.alert('Thành công', 'Đã tải ảnh lên thành công');
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
          } finally {
            setUploading(false);
          }
        } else {
          // Nếu không có onUpload, sử dụng local URI
          setSelectedAvatar(imageUri);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập',
        'Cần quyền truy cập camera để chụp ảnh'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        if (onUpload) {
          setUploading(true);
          try {
            const uploadedUrl = await onUpload(imageUri);
            setSelectedAvatar(uploadedUrl);
            Alert.alert('Thành công', 'Đã tải ảnh lên thành công');
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
          } finally {
            setUploading(false);
          }
        } else {
          setSelectedAvatar(imageUri);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const handleSelectPreset = (url: string) => {
    setSelectedAvatar(url);
  };

  const handleConfirm = () => {
    onSelect(selectedAvatar);
    setModalVisible(false);
  };

  const handleCustomUrl = () => {
    if (customUrl.trim()) {
      setSelectedAvatar(customUrl.trim());
      setCustomUrl('');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => setModalVisible(true)}
      >
        <OptimizedImage
          uri={currentAvatar || PRESET_AVATARS[0]}
          style={styles.avatar}
        />
        <View style={styles.editBadge}>
          <Text style={styles.editIcon}>✏️</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Avatar</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
              {/* Preview */}
              <View style={styles.previewContainer}>
                <OptimizedImage
                  uri={selectedAvatar || PRESET_AVATARS[0]}
                  style={styles.previewAvatar}
                />
                <Text style={styles.previewLabel}>Xem trước</Text>
              </View>

              {/* Upload Options */}
              <Text style={styles.sectionTitle}>Tải ảnh lên</Text>
              <View style={styles.uploadButtons}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handlePickImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#3498db" />
                  ) : (
                    <>
                      <Text style={styles.uploadIcon}>📁</Text>
                      <Text style={styles.uploadText}>Chọn từ thư viện</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleTakePhoto}
                  disabled={uploading}
                >
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Chụp ảnh</Text>
                </TouchableOpacity>
              </View>

              {/* Preset Avatars */}
              <Text style={styles.sectionTitle}>Avatar có sẵn</Text>
              <View style={styles.avatarGrid}>
                {PRESET_AVATARS.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.gridItem,
                      selectedAvatar === url && styles.gridItemSelected,
                    ]}
                    onPress={() => handleSelectPreset(url)}
                  >
                    <OptimizedImage
                      uri={url}
                      style={styles.gridAvatar}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom URL */}
              <Text style={styles.sectionTitle}>Hoặc nhập URL tùy chỉnh</Text>
              <View style={styles.customUrlContainer}>
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://example.com/avatar.jpg"
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.urlButton}
                  onPress={handleCustomUrl}
                >
                  <Text style={styles.urlButtonText}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[styles.confirmButton, uploading && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={uploading}
            >
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIcon: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    fontSize: 24,
    color: '#95a5a6',
  },
  scrollView: {
    padding: 20,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  previewAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
  },
  previewLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#7f8c8d',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 10,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginBottom: 10,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  gridItemSelected: {
    borderColor: '#3498db',
  },
  gridAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
  customUrlContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
  },
  urlButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  urlButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
    margin: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
});
