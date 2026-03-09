/**
 * Enhanced empty state for feed with filter suggestions
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import type { FilterConfig } from '../types/filter.types';

interface EmptyFeedStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onSuggestedFilter?: (filter: FilterConfig) => void;
  suggestions?: FilterConfig[];
}

export const EmptyFeedState: React.FC<EmptyFeedStateProps> = ({
  hasFilters,
  onClearFilters,
  onSuggestedFilter,
  suggestions = [],
}) => {
  if (hasFilters) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔍</Text>
        <Text style={styles.title}>Không tìm thấy bài viết</Text>
        <Text style={styles.description}>
          Không có bài viết nào phù hợp với bộ lọc của bạn
        </Text>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Thử các bộ lọc khác:</Text>
            {suggestions.map(suggestion => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionButton}
                onPress={() => onSuggestedFilter?.(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {onClearFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
            <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.title}>Chưa có bài viết nào</Text>
      <Text style={styles.description}>
        Kết bạn để xem bài viết của họ hoặc thử chế độ Khám phá
      </Text>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Bắt đầu với:</Text>
          {suggestions.map(suggestion => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionButton}
              onPress={() => onSuggestedFilter?.(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  suggestionsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionButton: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  suggestionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
