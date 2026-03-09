import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ForgotPasswordForm, useForgotPassword } from "../../src/features/auth";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendOTP } = useForgotPassword();

  const handleSendOtp = async (email: string) => {
    try {
      await sendOTP(email);
      alert("Mã OTP đã được gửi đến email của bạn!");
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email },
      });
    } catch (error: any) {
      alert(error.message || "Không thể gửi mã OTP!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ForgotPasswordForm
        onSubmit={handleSendOtp}
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
