import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { LoginForm, useLogin } from "../../src/features/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useLogin();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      await login(credentials);
      alert("Chào mừng quay trở lại!");
      router.replace("/(app)/(tabs)");
    } catch (error: any) {
      alert(error.message || "Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <View style={styles.container}>
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={() => router.push("/(auth)/forgot-password")}
        onRegister={() => router.push("/(auth)/register")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
