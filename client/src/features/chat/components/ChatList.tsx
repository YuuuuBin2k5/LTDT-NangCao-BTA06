import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import type { Conversation } from '../types';

interface ChatListProps {
  conversations: Conversation[];
  onConversationPress?: (conversation: Conversation) => void;
}

export function ChatList({ conversations, onConversationPress }: ChatListProps) {
  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {conversations.map((conversation) => (
        <View key={conversation.id} style={styles.conversationItem}>
          <Text style={styles.participantName}>{conversation.participantName}</Text>
          {conversation.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {conversation.lastMessage.content}
            </Text>
          )}
          {conversation.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  conversationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
