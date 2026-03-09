import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";

interface OTPInputProps {
  email: string;
  onVerify: (otpCode: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack?: () => void;
}

export function OTPInput({ email, onVerify, onResend, onBack }: OTPInputProps) {
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert("Vui lòng nhập mã OTP 6 số!");
      return;
    }

    setLoading(true);
    try {
      await onVerify(otpCode);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác thực OTP 🔐</Text>
      <Text style={styles.subtitle}>
        Mã OTP đã được gửi đến{"\n"}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập mã OTP (6 số)"
        keyboardType="number-pad"
        maxLength={6}
        value={otpCode}
        onChangeText={setOtpCode}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>XÁC THỰC</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResend}
        disabled={resending}
        style={styles.resendButton}
      >
        <Text style={styles.resendText}>
          {resending ? "Đang gửi..." : "Gửi lại mã OTP"}
        </Text>
      </TouchableOpacity>

      {onBack && (
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#3498db",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  email: {
    fontWeight: "bold",
    color: "#3498db",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 18,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resendButton: {
    padding: 15,
    alignItems: "center",
  },
  resendText: {
    color: "#3498db",
    fontSize: 16,
  },
  backText: {
    color: "#95a5a6",
    textAlign: "center",
    marginTop: 20,
  },
});
