/**
 * Button for marking posts as "Not Interested"
 */
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { feedbackService } from '../services/feedback.service';

interface NotInterestedButtonProps {
  postId: number;
  onFeedbackSubmitted?: () => void;
  compact?: boolean;
}

export const NotInterestedButton: React.FC<NotInterestedButtonProps> = ({
  postId,
  onFeedbackSubmitted,
  compact = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePress = async () => {
    Alert.alert(
      'Không quan tâm',
      'Bạn sẽ thấy ít bài viết tương tự hơn',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await feedbackService.submitFeedback({
                postId,
                feedbackType: 'NOT_INTERESTED',
              });
              setSubmitted(true);
              onFeedbackSubmitted?.();
            } catch (error) {
              console.error('Failed to submit feedback:', error);
              Alert.alert('Lỗi', 'Không thể gửi phản hồi. Vui lòng thử lại.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (submitted) {
    return (
      <TouchableOpacity style={[styles.button, styles.buttonSubmitted, compact && styles.buttonCompact]} disabled>
        <Text style={[styles.buttonText, styles.buttonTextSubmitted]}>✓ Đã ghi nhận</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, compact && styles.buttonCompact]}
      onPress={handlePress}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color="#666" />
      ) : (
        <Text style={styles.buttonText}>👎 Không quan tâm</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonCompact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonSubmitted: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  buttonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buttonTextSubmitted: {
    color: '#4caf50',
  },
});
