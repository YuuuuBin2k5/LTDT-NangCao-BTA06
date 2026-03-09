import { Stack, Redirect } from "expo-router";
import { useAuth, LocationProvider } from "../../src/store/contexts";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <LocationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mission-cart" />
        <Stack.Screen name="mission-tracker" />
        <Stack.Screen name="mission-checkin" />
        <Stack.Screen name="mission/[id]" />
      </Stack>
    </LocationProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
