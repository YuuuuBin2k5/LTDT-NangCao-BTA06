/**
 * PostDetailScreen - Full post detail view with comments
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { postService } from '../services/post.service';
import type { Post, Comment } from '../types/post.types';
import { ImageCarousel } from '../components/ImageCarousel';
import { LikeButton } from '../components/LikeButton';
import { CommentList } from '../components/CommentList';
import { CommentInput } from '../components/CommentInput';
import { LikeListModal } from '../components/LikeListModal';
import { usePostInteractions } from '../hooks/usePostInteractions';
import { useAuth } from '../../../store/contexts';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';

export const PostDetailScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showLikeList, setShowLikeList] = useState(false);

  const { toggleLike, addComment, deleteComment, isLiking, isCommenting } = usePostInteractions(
    post?.id || 0
  );

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  const loadPost = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await postService.getPost(parseInt(id));
      setPost(data);
    } catch (err) {
      setError(err as Error);
      Alert.alert('Lỗi', 'Không thể tải bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    if (!id) return;

    try {
      const data = await postService.getComments(parseInt(id));
      setComments(data.content);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const onLike = async () => {
    if (!post) return;
    
    const success = await toggleLike(post.isLiked);
    if (success) {
      // Refresh post to get updated like count
      loadPost();
    }
  };

  const onComment = async (content: string) => {
    if (!post) return;
    
    const comment = await addComment(content);
    if (comment) {
      // Refresh comments
      loadComments();
      // Update comment count
      loadPost();
    }
  };

  const onDeleteComment = async (commentId: number) => {
    const success = await deleteComment(commentId);
    if (success) {
      loadComments();
      loadPost();
    }
  };

  const handleMenuPress = () => {
    Alert.alert(
      'Tùy chọn',
      'Chọn hành động',
      [
        {
          text: 'Chỉnh sửa',
          onPress: handleEditPost,
        },
        {
          text: 'Xóa',
          onPress: handleDeletePost,
          style: 'destructive',
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ]
    );
  };

  const handleEditPost = () => {
    if (!post) return;
    router.push(`/post/edit/${post.id}` as any);
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài đăng này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await postService.deletePost(post!.id);
              Alert.alert('Thành công', 'Đã xóa bài đăng', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error('Failed to delete post:', error);
              Alert.alert('Lỗi', 'Không thể xóa bài đăng');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Không thể tải bài viết</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPost}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          
          {/* Menu button for post owner */}
          {user && post.user.id === user.id && (
            <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
              <Text style={styles.menuButtonText}>⋮</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          {post.user.avatarUrl ? (
            <OptimizedImage 
              uri={post.user.avatarUrl}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{post.user.nickName[0]}</Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.user.nickName}</Text>
            <Text style={styles.username}>@{post.user.username}</Text>
          </View>
        </View>

        {/* Images */}
        {post.images.length > 0 && (
          <ImageCarousel images={post.images} />
        )}

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.content}>{post.content}</Text>
          
          {/* Location */}
          {post.locationName && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{post.locationName}</Text>
            </View>
          )}

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {post.hashtags.map((tag, index) => (
                <Text key={index} style={styles.hashtag}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}

          {/* Stats */}
          <TouchableOpacity 
            style={styles.statsContainer}
            onPress={() => setShowLikeList(true)}
          >
            <Text style={styles.statsText}>
              {post.likeCount} lượt thích • {post.commentCount} bình luận
            </Text>
            <Text style={styles.dateText}>
              {new Date(post.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <LikeButton
              isLiked={post.isLiked}
              likeCount={post.likeCount}
              onToggle={onLike}
            />
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Bình luận</Text>
          <CommentList
            comments={comments}
            currentUserId={user?.id}
            onDeleteComment={onDeleteComment}
          />
        </View>
      </ScrollView>

      {/* Comment Input */}
      <CommentInput onSubmit={onComment} />

      {/* Like List Modal */}
      {post && (
        <LikeListModal
          visible={showLikeList}
          postId={post.id}
          onClose={() => setShowLikeList(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contentSection: {
    padding: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  hashtag: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  actionsContainer: {
    marginTop: 16,
  },
  commentsSection: {
    padding: 16,
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
});
