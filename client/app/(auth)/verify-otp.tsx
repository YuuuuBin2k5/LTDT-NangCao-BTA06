import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { OTPInput, useOTP } from "../../src/features/auth";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOTP, resendOTP } = useOTP();

  const handleVerify = async (otpCode: string) => {
    try {
      await verifyOTP(otpCode);
      alert("Xác thực thành công!");
      router.replace("/(app)/(tabs)");
    } catch (error: any) {
      alert(error.message || "Mã OTP không hợp lệ!");
    }
  };

  const handleResend = async () => {
    if (!email) {
      alert("Không tìm thấy email!");
      return;
    }

    try {
      await resendOTP(email);
      alert("Đã gửi lại mã OTP!");
    } catch (error: any) {
      alert(error.message || "Không thể gửi lại mã OTP!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <OTPInput
        email={email || ""}
        onVerify={handleVerify}
        onResend={handleResend}
        onBack={() => router.back()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: "#fff",
    minHeight: "100%",
  },
});
