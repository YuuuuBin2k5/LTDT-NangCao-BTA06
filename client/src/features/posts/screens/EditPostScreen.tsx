/**
 * Edit Post Screen
 * Allows users to edit their existing posts
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { postService } from '../services/post.service';
import type { Post, UpdatePostRequest, PostPrivacy } from '../types/post.types';

export const EditPostScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ postId: string }>();
  const postId = params.postId ? parseInt(params.postId, 10) : null;

  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PostPrivacy>('PUBLIC' as PostPrivacy);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load post data
  useEffect(() => {
    if (!postId) {
      Alert.alert('Lỗi', 'Không tìm thấy bài đăng');
      router.back();
      return;
    }

    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const postData = await postService.getPost(postId!);
      setPost(postData);
      setContent(postData.content);
      setPrivacy(postData.privacy);
    } catch (error) {
      console.error('Failed to load post:', error);
      Alert.alert('Lỗi', 'Không thể tải bài đăng');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
      return;
    }

    try {
      setIsSaving(true);

      const request: UpdatePostRequest = {
        content: content.trim(),
        privacy,
      };

      await postService.updatePost(postId!, request);

      Alert.alert('Thành công', 'Đã cập nhật bài đăng', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to update post:', error);
      Alert.alert('Lỗi', error?.message || 'Không thể cập nhật bài đăng');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa bài đăng</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerButton, isSaving && styles.headerButtonDisabled]}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={[styles.headerButtonText, styles.saveButton]}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Nội dung</Text>
          <TextInput
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Privacy Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Quyền riêng tư</Text>
          <View style={styles.privacyOptions}>
            <TouchableOpacity
              style={[
                styles.privacyOption,
                privacy === 'PUBLIC' && styles.privacyOptionSelected,
              ]}
              onPress={() => setPrivacy('PUBLIC' as PostPrivacy)}
            >
              <Text
                style={[
                  styles.privacyOptionText,
                  privacy === 'PUBLIC' && styles.privacyOptionTextSelected,
                ]}
              >
                🌍 Công khai
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.privacyOption,
                privacy === 'FRIENDS_ONLY' && styles.privacyOptionSelected,
              ]}
              onPress={() => setPrivacy('FRIENDS_ONLY' as PostPrivacy)}
            >
              <Text
                style={[
                  styles.privacyOptionText,
                  privacy === 'FRIENDS_ONLY' && styles.privacyOptionTextSelected,
                ]}
              >
                👥 Bạn bè
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.privacyOption,
                privacy === 'PRIVATE' && styles.privacyOptionSelected,
              ]}
              onPress={() => setPrivacy('PRIVATE' as PostPrivacy)}
            >
              <Text
                style={[
                  styles.privacyOptionText,
                  privacy === 'PRIVATE' && styles.privacyOptionTextSelected,
                ]}
              >
                🔒 Riêng tư
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            ℹ️ Lưu ý: Bạn không thể thay đổi hình ảnh hoặc vị trí của bài đăng
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButton: {
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  privacyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  privacyOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  privacyOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  privacyOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  note: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
