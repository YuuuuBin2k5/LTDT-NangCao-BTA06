import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/store/contexts";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  // Don't redirect while loading
  if (isLoading) {
    return null;
  }

  // Redirect to app if already authenticated
  if (user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: "Đăng nhập" }} />
      <Stack.Screen name="register" options={{ title: "Đăng ký" }} />
      <Stack.Screen name="verify-otp" options={{ title: "Xác thực OTP" }} />
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Quên mật khẩu" }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ title: "Đặt lại mật khẩu" }}
      />
    </Stack>
  );
}
