/**
 * Badge showing why a post was recommended
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { recommendationService } from '../services/recommendation.service';

interface RecommendationBadgeProps {
  postId: number;
  isRecommended?: boolean;
}

export const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({
  postId,
  isRecommended = false,
}) => {
  const [reason, setReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isRecommended) return;

    const fetchReason = async () => {
      setIsLoading(true);
      try {
        const reasonText = await recommendationService.getRecommendationReason(postId);
        setReason(reasonText);
      } catch (error) {
        console.error('Failed to fetch recommendation reason:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReason();
  }, [postId, isRecommended]);

  if (!isRecommended || !reason) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✨</Text>
      <Text style={styles.text}>{reason}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  text: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});
