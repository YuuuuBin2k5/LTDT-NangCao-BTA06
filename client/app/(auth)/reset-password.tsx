import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ResetPasswordForm, useForgotPassword } from "../../src/features/auth";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resetPassword } = useForgotPassword();

  const handleResetPassword = async (data: { otpCode: string; newPassword: string }) => {
    if (!email) {
      alert("Không tìm thấy email!");
      return;
    }

    try {
      await resetPassword({
        email,
        otpCode: data.otpCode,
        newPassword: data.newPassword,
      });
      alert("Đặt lại mật khẩu thành công!");
      router.replace("/(auth)/login");
    } catch (error: any) {
      alert(error.message || "Không thể đặt lại mật khẩu!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ResetPasswordForm
        email={email || ""}
        onSubmit={handleResetPassword}
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
