import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { ChatList, useChat } from "@/src/features/chat";

export default function ChatScreen() {
  const { conversations, isLoading, loadConversations } = useChat();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Tin nhắn</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.text}>Đang tải...</Text>
        </View>
      ) : (
        <ChatList conversations={conversations} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: "#666",
  },
});
