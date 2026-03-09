import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/store/contexts';
import {
  EditProfileForm,
  SettingsSection,
  SettingsItem,
  ProfileFormData,
  ChangePasswordForm,
  ChangePasswordFormData,
  ChangeContactWithOTPForm,
} from '../../../src/features/profile/components';
import { AvatarFrameSelector } from '../../../src/features/friends/components/AvatarFrameSelector';
import { useProfile } from '../../../src/features/profile/hooks/useProfile';
import { ContactType } from '../../../src/services/profile/profile.service';
import { OptimizedImage } from '../../../src/shared/components/OptimizedImage';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { profile, updateProfile, changePassword, requestContactChange, verifyContactChange } = useProfile(user);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [changeEmailModalVisible, setChangeEmailModalVisible] = useState(false);
  const [changePhoneModalVisible, setChangePhoneModalVisible] = useState(false);
  const [avatarFrameSelectorVisible, setAvatarFrameSelectorVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  // Track new contact values for resending OTP
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      setEditModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({ 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword 
      });
      setChangePasswordModalVisible(false);
      Alert.alert('Thành công', 'Đã đổi mật khẩu thành công');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu');
      throw error;
    }
  };

  const handleRequestEmailChange = async (newEmail: string) => {
    try {
      setPendingEmail(newEmail);
      await requestContactChange(newEmail, ContactType.EMAIL);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi yêu cầu đổi email');
      throw error;
    }
  };

  const handleVerifyEmailChange = async (otpCode: string) => {
    try {
      await verifyContactChange(otpCode, ContactType.EMAIL);
      setChangeEmailModalVisible(false);
      setPendingEmail('');
      Alert.alert('Thành công', 'Đã đổi email thành công');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể xác thực email');
      throw error;
    }
  };

  const handleResendEmailOTP = async () => {
    try {
      await requestContactChange(pendingEmail, ContactType.EMAIL);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã OTP');
      throw error;
    }
  };

  const handleRequestPhoneChange = async (newPhone: string) => {
    try {
      setPendingPhone(newPhone);
      await requestContactChange(newPhone, ContactType.PHONE);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi yêu cầu đổi số điện thoại');
      throw error;
    }
  };

  const handleVerifyPhoneChange = async (otpCode: string) => {
    try {
      await verifyContactChange(otpCode, ContactType.PHONE);
      setChangePhoneModalVisible(false);
      setPendingPhone('');
      Alert.alert('Thành công', 'Đã đổi số điện thoại thành công');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể xác thực số điện thoại');
      throw error;
    }
  };

  const handleResendPhoneOTP = async () => {
    try {
      await requestContactChange(pendingPhone, ContactType.PHONE);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã OTP');
      throw error;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Xóa bộ nhớ đệm',
      'Bạn có chắc chắn muốn xóa bộ nhớ đệm?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('userToken');
            Alert.alert('Thành công', 'Đã xóa bộ nhớ đệm');
            handleLogout();
          },
        },
      ]
    );
  };

  const accountItems: SettingsItem[] = [
    {
      id: 'edit-profile',
      icon: '✏️',
      label: 'Chỉnh sửa thông tin',
      type: 'navigation',
      onPress: handleEditProfile,
    },
    {
      id: 'avatar-frame',
      icon: '🖼️',
      label: 'Khung avatar',
      type: 'navigation',
      onPress: () => setAvatarFrameSelectorVisible(true),
    },
    {
      id: 'change-password',
      icon: '🔒',
      label: 'Đổi mật khẩu',
      type: 'navigation',
      onPress: () => setChangePasswordModalVisible(true),
    },
    {
      id: 'change-email',
      icon: '📧',
      label: 'Đổi email',
      type: 'navigation',
      onPress: () => setChangeEmailModalVisible(true),
    },
    {
      id: 'change-phone',
      icon: '📱',
      label: 'Đổi số điện thoại',
      type: 'navigation',
      onPress: () => setChangePhoneModalVisible(true),
    },
  ];

  const preferencesItems: SettingsItem[] = [
    {
      id: 'notifications',
      icon: '🔔',
      label: 'Thông báo',
      type: 'toggle',
      toggleValue: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: 'location',
      icon: '📍',
      label: 'Chia sẻ vị trí',
      type: 'toggle',
      toggleValue: locationEnabled,
      onToggle: setLocationEnabled,
    },
  ];

  const appItems: SettingsItem[] = [
    {
      id: 'version',
      icon: 'ℹ️',
      label: 'Phiên bản',
      value: '1.0.0',
      type: 'info',
    },
    {
      id: 'clear-cache',
      icon: '🗑️',
      label: 'Xóa bộ nhớ đệm',
      type: 'navigation',
      onPress: handleClearCache,
    },
  ];

  const dangerItems: SettingsItem[] = [
    {
      id: 'logout',
      icon: '🚪',
      label: 'Đăng xuất',
      type: 'navigation',
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={handleEditProfile}
        >
          <OptimizedImage
            uri={
              profile?.avatarUrl ||
              'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'
            }
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.nickName}</Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            {profile?.bio && (
              <Text style={styles.profileBio} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}
          </View>
          <Text style={styles.profileChevron}>›</Text>
        </TouchableOpacity>

        {/* Settings Sections */}
        <View style={styles.sectionsContainer}>
          <SettingsSection title="Tài khoản" items={accountItems} />
          <SettingsSection title="Tùy chọn" items={preferencesItems} />
          <SettingsSection title="Ứng dụng" items={appItems} />
          <SettingsSection title="Nguy hiểm" items={dangerItems} />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setEditModalVisible(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
          <View style={{ width: 24 }} />
        </View>
        <EditProfileForm
          initialData={{
            nickName: profile?.nickName || '',
            bio: profile?.bio || '',
            avatarUrl:
              profile?.avatarUrl ||
              'https://api.dicebear.com/7.x/avataaars/svg?seed=Default',
          }}
          onSave={handleSaveProfile}
          onCancel={() => setEditModalVisible(false)}
        />
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setChangePasswordModalVisible(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
          <View style={{ width: 24 }} />
        </View>
        <ChangePasswordForm
          onSubmit={handleChangePassword}
          onCancel={() => setChangePasswordModalVisible(false)}
        />
      </Modal>

      {/* Change Email Modal */}
      <Modal
        visible={changeEmailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChangeEmailModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setChangeEmailModalVisible(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Đổi email</Text>
          <View style={{ width: 24 }} />
        </View>
        <ChangeContactWithOTPForm
          type="email"
          currentValue={profile?.email || ''}
          onRequestChange={handleRequestEmailChange}
          onVerifyChange={handleVerifyEmailChange}
          onResendOTP={handleResendEmailOTP}
          onCancel={() => setChangeEmailModalVisible(false)}
        />
      </Modal>

      {/* Change Phone Modal */}
      <Modal
        visible={changePhoneModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChangePhoneModalVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setChangePhoneModalVisible(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Đổi số điện thoại</Text>
          <View style={{ width: 24 }} />
        </View>
        <ChangeContactWithOTPForm
          type="phone"
          currentValue={profile?.phone || ''}
          onRequestChange={handleRequestPhoneChange}
          onVerifyChange={handleVerifyPhoneChange}
          onResendOTP={handleResendPhoneOTP}
          onCancel={() => setChangePhoneModalVisible(false)}
        />
      </Modal>

      {/* Avatar Frame Selector Modal */}
      <AvatarFrameSelector
        visible={avatarFrameSelectorVisible}
        onClose={() => setAvatarFrameSelectorVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e0e0',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 4,
  },
  profileChevron: {
    fontSize: 28,
    color: '#bdc3c7',
    marginLeft: 8,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalClose: {
    fontSize: 24,
    color: '#95a5a6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

