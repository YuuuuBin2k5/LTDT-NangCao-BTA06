import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { AvatarPicker } from './AvatarPicker';
import { uploadService } from '../../../services/upload/upload.service';

export interface ProfileFormData {
  nickName: string;
  bio: string;
  avatarUrl: string;
}

interface EditProfileFormProps {
  initialData: ProfileFormData;
  onSave: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
}

export function EditProfileForm({
  initialData,
  onSave,
  onCancel,
}: EditProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.nickName.trim()) {
      newErrors.nickName = 'Biệt danh không được để trống';
    } else if (formData.nickName.length < 2) {
      newErrors.nickName = 'Biệt danh phải có ít nhất 2 ký tự';
    } else if (formData.nickName.length > 50) {
      newErrors.nickName = 'Biệt danh không được quá 50 ký tự';
    }

    if (formData.bio && formData.bio.length > 255) {
      newErrors.bio = 'Giới thiệu không được quá 255 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (imageUri: string): Promise<string> => {
    try {
      const uploadedUrl = await uploadService.uploadAvatar(imageUri);
      return uploadedUrl;
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Avatar Picker */}
        <AvatarPicker
          currentAvatar={formData.avatarUrl}
          onSelect={(url) => setFormData({ ...formData, avatarUrl: url })}
          onUpload={handleUploadAvatar}
        />

        {/* Nick Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Biệt danh <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.nickName && styles.inputError]}
            value={formData.nickName}
            onChangeText={(text) =>
              setFormData({ ...formData, nickName: text })
            }
            placeholder="Nhập biệt danh của bạn"
            maxLength={50}
          />
          {errors.nickName && (
            <Text style={styles.errorText}>{errors.nickName}</Text>
          )}
          <Text style={styles.charCount}>
            {formData.nickName.length}/50
          </Text>
        </View>

        {/* Bio */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Giới thiệu bản thân</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.bio && styles.inputError,
            ]}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Viết vài dòng về bản thân..."
            multiline
            numberOfLines={4}
            maxLength={255}
          />
          {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
          <Text style={styles.charCount}>{formData.bio.length}/255</Text>
        </View>

        {/* Avatar URL Display */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>URL Avatar</Text>
          <Text style={styles.urlDisplay} numberOfLines={2}>
            {formData.avatarUrl || 'Chưa chọn avatar'}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 4,
  },
  urlDisplay: {
    fontSize: 14,
    color: '#7f8c8d',
    padding: 14,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  cancelButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
});
