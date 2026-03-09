import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { RegisterForm, RegisterFormData, useRegister } from "../../src/features/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useRegister();

  const handleRegister = async (formData: RegisterFormData) => {
    try {
      await register(formData);
      alert("Đăng ký thành công! Vui lòng xác thực OTP.");
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: formData.email },
      });
    } catch (error: any) {
      alert(error.message || "Đăng ký thất bại");
    }
  };

  return (
    <View style={styles.container}>
      <RegisterForm onSubmit={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
