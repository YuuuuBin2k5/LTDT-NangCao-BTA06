/**
 * Service for user feedback on posts
 */
import { apiClient } from '../../../services/api/client';

export type FeedbackType = 'NOT_INTERESTED' | 'HIDE_POST' | 'REPORT_SPAM' | 'HELPFUL' | 'NOT_RELEVANT';

export interface SubmitFeedbackRequest {
  postId: number;
  feedbackType: FeedbackType;
  reason?: string;
}

class FeedbackService {
  /**
   * Submit feedback for a post
   */
  async submitFeedback(data: SubmitFeedbackRequest): Promise<void> {
    await apiClient.post('/feedback', data);
  }
}

export const feedbackService = new FeedbackService();
