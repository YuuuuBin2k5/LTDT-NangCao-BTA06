/**
 * Image upload service
 */
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { apiClient } from '../../../services/api/client';
import type { ImageUploadResult } from '../types/post.types';

class ImageService {
  /**
   * Pick images from library
   */
  async pickImages(maxImages: number = 5): Promise<string[]> {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library is required');
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxImages,
    });

    if (result.canceled) {
      return [];
    }

    return result.assets.map(asset => asset.uri);
  }

  /**
   * Take photo with camera
   */
  async takePhoto(): Promise<string | null> {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access camera is required');
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  }

  /**
   * Compress image before upload
   */
  async compressImage(uri: string, quality: number = 0.8): Promise<string> {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1920 } }], // Max width 1920px
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipResult.uri;
  }

  /**
   * Upload single image
   */
  async uploadImage(uri: string): Promise<ImageUploadResult> {
    try {
      // Compress image first
      const compressedUri = await this.compressImage(uri);

      // Create form data
      const formData = new FormData();
      const filename = compressedUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: compressedUri,
        name: filename,
        type,
      } as any);

      console.log('Uploading image:', { uri: compressedUri, filename, type });

      // Upload
      const response = await apiClient.post<ImageUploadResult>(
        '/posts/images/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload response:', response);

      return response;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(uris: string[]): Promise<ImageUploadResult[]> {
    const uploadPromises = uris.map(uri => 
      this.uploadImage(uri).catch(error => {
        console.error('Failed to upload image:', uri, error);
        throw error; // Re-throw to fail the entire operation
      })
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image
   */
  async deleteImage(imageUrl: string): Promise<void> {
    await apiClient.delete('/posts/images', {
      params: { url: imageUrl },
    });
  }
}

export const imageService = new ImageService();
