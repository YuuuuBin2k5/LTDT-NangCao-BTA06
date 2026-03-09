import { apiClient } from '../api/client';
import { AppError } from '../../shared/types/error.types';

/**
 * Upload service for handling file uploads
 */
class UploadServiceImpl {
  /**
   * Upload image to server
   * @param imageUri Local image URI
   * @returns Promise<string> Uploaded image URL
   */
  async uploadImage(imageUri: string): Promise<string> {
    try {
      console.log('📤 Uploading image:', imageUri);

      // Create form data
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Append image to form data
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      // Upload to server
      const response = await apiClient.post<{ url: string }>(
        '/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Image uploaded successfully:', response.url);
      return response.url;
    } catch (error: any) {
      console.error('❌ Failed to upload image:', error);
      throw new AppError(
        'Không thể tải ảnh lên',
        'UPLOAD_ERROR',
        error
      );
    }
  }

  /**
   * Upload avatar specifically
   * @param imageUri Local image URI
   * @returns Promise<string> Uploaded avatar URL
   */
  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      console.log('📤 Uploading avatar:', imageUri);

      // If it's already an external URL (http/https), return it directly
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        console.log('✅ Using external URL directly:', imageUri);
        return imageUri;
      }

      // Upload local file to server
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await apiClient.post<{ imageUrl: string; thumbnailUrl: string }>(
        '/posts/images/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Avatar uploaded successfully:', response.imageUrl);
      return response.imageUrl;
    } catch (error: any) {
      console.error('❌ Failed to upload avatar:', error);
      throw new AppError(
        'Không thể tải avatar lên',
        'AVATAR_UPLOAD_ERROR',
        error
      );
    }
  }
}

export const uploadService = new UploadServiceImpl();
