/**
 * Comment list component
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';
import type { Comment } from '../types/post.types';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  onDeleteComment?: (commentId: number) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  currentUserId,
  onDeleteComment,
}) => {
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (comments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {comments.map((item) => {
        const isOwner = currentUserId === item.user.id;

        return (
          <View key={item.id} style={styles.commentItem}>
            {/* Avatar */}
            <OptimizedImage
              uri={item.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'}
              style={styles.avatar}
            />

            {/* Content */}
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.userName}>{item.user.nickName}</Text>
                <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{item.content}</Text>

              {/* Delete button for owner */}
              {isOwner && onDeleteComment && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteComment(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  deleteButton: {
    marginTop: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ff3b30',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});

