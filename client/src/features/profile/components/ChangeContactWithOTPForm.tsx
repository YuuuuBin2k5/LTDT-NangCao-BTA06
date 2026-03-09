import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { isValidEmail, isValidPhone } from '../../../shared/utils/validation.utils';
import { OTPCountdownTimer } from './OTPCountdownTimer';

export type ContactType = 'email' | 'phone';

export interface ChangeContactWithOTPFormProps {
  type: ContactType;
  currentValue: string;
  onRequestChange: (newContact: string) => Promise<void>;
  onVerifyChange: (otpCode: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  onCancel?: () => void;
}

type FormStep = 'input' | 'verify';

export function ChangeContactWithOTPForm({
  type,
  currentValue,
  onRequestChange,
  onVerifyChange,
  onResendOTP,
  onCancel,
}: ChangeContactWithOTPFormProps) {
  const [step, setStep] = useState<FormStep>('input');
  const [newContact, setNewContact] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const isEmail = type === 'email';
  const label = isEmail ? 'Email' : 'Số điện thoại';
  const placeholder = isEmail
    ? 'Nhập email mới'
    : 'Nhập số điện thoại mới (VD: 0912345678)';

  const validateInput = (): boolean => {
    if (!newContact || newContact.trim().length === 0) {
      setError(`Vui lòng nhập ${label.toLowerCase()} mới`);
      return false;
    }

    if (isEmail) {
      if (!isValidEmail(newContact)) {
        setError('Email không hợp lệ');
        return false;
      }
    } else {
      if (!isValidPhone(newContact)) {
        setError('Số điện thoại không hợp lệ');
        return false;
      }
    }

    // Check if new value is same as current
    if (newContact.trim() === currentValue.trim()) {
      setError(`${label} mới phải khác với ${label.toLowerCase()} hiện tại`);
      return false;
    }

    setError(undefined);
    return true;
  };

  const handleRequestChange = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      await onRequestChange(newContact.trim());
      // Move to OTP verification step
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Không thể gửi mã OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChange = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      await onVerifyChange(otpCode);
      // Reset form on success
      setStep('input');
      setNewContact('');
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(undefined);
    try {
      await onResendOTP();
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP');
    }
  };

  const handleBack = () => {
    setStep('input');
    setOtpCode('');
    setError(undefined);
  };

  // Step 1: Input new contact
  if (step === 'input') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đổi {label}</Text>
        <Text style={styles.subtitle}>
          {label} hiện tại: <Text style={styles.currentValue}>{currentValue}</Text>
        </Text>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{label} mới</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={placeholder}
            value={newContact}
            onChangeText={(text) => {
              setNewContact(text);
              if (error) {
                setError(undefined);
              }
            }}
            keyboardType={isEmail ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Bạn sẽ nhận được mã OTP để xác nhận thay đổi {label.toLowerCase()}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleRequestChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Tiếp tục</Text>
            )}
          </TouchableOpacity>

          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Step 2: Verify OTP
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác thực OTP 🔐</Text>
      <Text style={styles.subtitle}>
        Mã OTP đã được gửi đến{'\n'}
        <Text style={styles.highlightedValue}>{newContact}</Text>
      </Text>

      {/* OTP Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mã OTP</Text>
        <TextInput
          style={[styles.input, styles.otpInput, error && styles.inputError]}
          placeholder="Nhập mã OTP (6 số)"
          keyboardType="number-pad"
          maxLength={6}
          value={otpCode}
          onChangeText={(text) => {
            setOtpCode(text);
            if (error) {
              setError(undefined);
            }
          }}
          editable={!loading}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Countdown Timer */}
      <OTPCountdownTimer onResend={handleResendOTP} initialSeconds={180} />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleVerifyChange}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Xác thực</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  currentValue: {
    fontWeight: '600',
    color: '#333',
  },
  highlightedValue: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  otpInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
  infoBox: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#2e7d32',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
