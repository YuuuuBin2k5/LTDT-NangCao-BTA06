import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../src/store/contexts";
import { NetworkProvider } from "../src/shared/contexts/NetworkContext";
import { ToastProvider } from "../src/shared/contexts/ToastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 phút
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
          <AuthProvider>
            <ToastProvider>
              <Slot />
            </ToastProvider>
          </AuthProvider>
        </NetworkProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

