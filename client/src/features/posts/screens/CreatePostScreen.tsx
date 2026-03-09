/**
 * Screen for creating a new post with offline support
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCreatePost } from '../hooks/useCreatePost';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useNetwork } from '../../../shared/contexts/NetworkContext';
import { imageService } from '../services/image.service';
import { PostPrivacy } from '../types/post.types';

export const CreatePostScreen: React.FC = () => {
  const router = useRouter();
  const { createPost, isLoading, error: createPostError } = useCreatePost();
  const { queueSize } = useOfflineSync();
  const { isConnected, isInternetReachable } = useNetwork();

  const [content, setContent] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState('');
  const [privacy, setPrivacy] = useState<PostPrivacy>(PostPrivacy.PUBLIC);

  const isOnline = isConnected && (isInternetReachable === null || isInternetReachable);

  /**
   * Get current location
   */
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập vị trí');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        const name = [addr.street, addr.city, addr.country]
          .filter(Boolean)
          .join(', ');
        setLocationName(name);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    }
  };

  /**
   * Pick images from library
   */
  const handlePickImages = async () => {
    try {
      const maxImages = 5 - imageUris.length;
      if (maxImages <= 0) {
        Alert.alert('Thông báo', 'Tối đa 5 ảnh mỗi bài đăng');
        return;
      }

      const uris = await imageService.pickImages(maxImages);
      setImageUris([...imageUris, ...uris]);
    } catch (error) {
      console.error('Failed to pick images:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  /**
   * Take photo with camera
   */
  const handleTakePhoto = async () => {
    try {
      if (imageUris.length >= 5) {
        Alert.alert('Thông báo', 'Tối đa 5 ảnh mỗi bài đăng');
        return;
      }

      const uri = await imageService.takePhoto();
      if (uri) {
        setImageUris([...imageUris, uri]);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  /**
   * Remove image
   */
  const handleRemoveImage = (index: number) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
  };

  /**
   * Submit post
   */
  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
      return;
    }

    if (!location) {
      Alert.alert('Lỗi', 'Vui lòng chọn vị trí');
      return;
    }

    const post = await createPost(
      {
        content: content.trim(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationName,
        privacy,
      },
      imageUris
    );

    if (post) {
      Alert.alert('Thành công', 'Đã đăng bài', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else if (!isOnline) {
      Alert.alert(
        'Đã lưu',
        'Bạn đang offline. Bài đăng sẽ được tự động đăng khi có kết nối.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      const errorMessage = createPostError?.message || 'Không thể đăng bài';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Offline banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              📵 Bạn đang offline. Bài đăng sẽ được lưu và tự động đăng khi có kết nối.
            </Text>
          </View>
        )}

        {/* Queue info */}
        {queueSize > 0 && (
          <View style={styles.queueBanner}>
            <Text style={styles.queueBannerText}>
              📤 {queueSize} bài đăng đang chờ đồng bộ
            </Text>
          </View>
        )}

        {/* Content input */}
        <TextInput
          style={styles.textInput}
          placeholder="Bạn đang nghĩ gì?"
          placeholderTextColor="#999"
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={5000}
        />

        {/* Image grid */}
        {imageUris.length > 0 && (
          <View style={styles.imageGrid}>
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Image buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handlePickImages}>
            <Text style={styles.buttonText}>📷 Thêm ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <Text style={styles.buttonText}>📸 Chụp ảnh</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vị trí</Text>
          {location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                📍 {locationName || 'Vị trí hiện tại'}
              </Text>
              <TouchableOpacity onPress={getCurrentLocation}>
                <Text style={styles.changeButton}>Đổi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.buttonText}>📍 Chọn vị trí</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
          <View style={styles.privacyButtons}>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                privacy === PostPrivacy.PUBLIC && styles.privacyButtonActive,
              ]}
              onPress={() => setPrivacy(PostPrivacy.PUBLIC)}
            >
              <Text
                style={[
                  styles.privacyButtonText,
                  privacy === PostPrivacy.PUBLIC && styles.privacyButtonTextActive,
                ]}
              >
                🌍 Công khai
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                privacy === PostPrivacy.FRIENDS_ONLY && styles.privacyButtonActive,
              ]}
              onPress={() => setPrivacy(PostPrivacy.FRIENDS_ONLY)}
            >
              <Text
                style={[
                  styles.privacyButtonText,
                  privacy === PostPrivacy.FRIENDS_ONLY &&
                    styles.privacyButtonTextActive,
                ]}
              >
                👥 Bạn bè
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                privacy === PostPrivacy.PRIVATE && styles.privacyButtonActive,
              ]}
              onPress={() => setPrivacy(PostPrivacy.PRIVATE)}
            >
              <Text
                style={[
                  styles.privacyButtonText,
                  privacy === PostPrivacy.PRIVATE && styles.privacyButtonTextActive,
                ]}
              >
                🔒 Riêng tư
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isOnline ? 'Đăng bài' : 'Lưu để đăng sau'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  offlineBanner: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  queueBanner: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  queueBannerText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  changeButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  privacyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#e8f4ff',
  },
  privacyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  privacyButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
