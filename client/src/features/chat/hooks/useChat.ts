import { useState, useCallback } from 'react';
import type { Conversation, ChatState } from '../types';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
  });

  const loadConversations = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // TODO: Implement API call to fetch conversations
      // const conversations = await chatService.getConversations();
      // setState((prev) => ({ ...prev, conversations, isLoading: false }));
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // TODO: Implement API call to fetch messages
      // const messages = await chatService.getMessages(conversationId);
      // setState((prev) => ({ ...prev, messages, isLoading: false }));
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to load messages:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const sendMessage = useCallback(async (content: string, receiverId: string) => {
    try {
      // TODO: Implement API call to send message
      // const message = await chatService.sendMessage({ content, receiverId });
      // setState((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, []);

  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    setState((prev) => ({ ...prev, activeConversation: conversation }));
  }, []);

  return {
    conversations: state.conversations,
    activeConversation: state.activeConversation,
    messages: state.messages,
    isLoading: state.isLoading,
    loadConversations,
    loadMessages,
    sendMessage,
    setActiveConversation,
  };
}
