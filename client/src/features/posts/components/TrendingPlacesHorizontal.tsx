import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../../services/api/client';
import type { Place } from '../../../services/location/location.service';
import { PlaceCard } from '../../map/components/PlaceCard';

export const TrendingPlacesHorizontal: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingPlaces = async () => {
      try {
        // Fetch top 10 places sorted by rating
        const response = await apiClient.get('/places/search', {
          params: { size: 10, minRating: 4.0 }
        });
        
        // Handle paginated response format
        const data = response.data?.content || response.data || [];
        setPlaces(data);
      } catch (error) {
        console.error('Failed to fetch trending places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPlaces();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  if (places.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Địa Điểm Hot Nhất</Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={places}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PlaceCard place={item} onPress={(p) => router.push(`/place/${p.id}` as any)} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: 280, // Slightly smaller width for horizontal scroll
    marginRight: -16, // Adjust padding issue
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
