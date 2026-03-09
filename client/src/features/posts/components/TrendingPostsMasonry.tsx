import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../../services/api/client';
import type { Post } from '../types/post.types';
import { PostCard } from './PostCard';

export const TrendingPostsMasonry: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        // Fetch 20 posts sorted by engagement (trending filter)
        const response = await apiClient.get('/posts/feed', {
          params: { size: 20, engagementFilter: 'trending' }
        });
        
        const data = response.data?.content || response.data || [];
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch trending posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  if (posts.length === 0) return null;

  // Split posts into two columns for masonry effect
  const leftColumn = posts.filter((_, index) => index % 2 === 0);
  const rightColumn = posts.filter((_, index) => index % 2 === 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 Xu Hướng Khám Phá</Text>
        <Text style={styles.subtitle}>Gợi ý dựa trên điểm tương tác</Text>
      </View>
      
      <View style={styles.masonryContainer}>
        {/* Left Column */}
        <View style={styles.column}>
          {leftColumn.map(post => (
            <View key={post.id} style={styles.gridItem}>
              <PostCard post={post} onPress={(p) => router.push(`/post/${p.id}` as any)} />
            </View>
          ))}
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {rightColumn.map(post => (
            <View key={post.id} style={styles.gridItem}>
              <PostCard post={post} onPress={(p) => router.push(`/post/${p.id}` as any)} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  header: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    paddingHorizontal: 4,
  },
  gridItem: {
    marginBottom: 12,
    // Add shadow scaling down to fit grid
    transform: [{ scale: 0.98 }] 
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
