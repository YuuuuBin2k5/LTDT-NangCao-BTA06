import React from 'react';
import { render } from '@testing-library/react-native';
import { ReviewCard } from '../ReviewCard';
import { Review } from '../../../../services/location/location.service';

describe('ReviewCard', () => {
  const mockReview: Review = {
    id: 1,
    content: 'Great place! Highly recommend visiting.',
    rating: 5,
    isPublic: true,
    createdAt: new Date().toISOString(),
    author: {
      id: 1,
      name: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  };

  it('renders review content correctly', () => {
    const { getByText } = render(<ReviewCard review={mockReview} />);
    
    expect(getByText('Great place! Highly recommend visiting.')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('displays correct number of stars for rating', () => {
    const { getByText } = render(<ReviewCard review={mockReview} />);
    
    // 5 filled stars, 0 empty stars
    expect(getByText('★★★★★')).toBeTruthy();
  });

  it('displays globe icon for public reviews', () => {
    const { getByText } = render(<ReviewCard review={mockReview} />);
    
    expect(getByText('🌎')).toBeTruthy();
  });

  it('displays friends icon for private reviews', () => {
    const privateReview: Review = {
      ...mockReview,
      isPublic: false,
    };
    
    const { getByText } = render(<ReviewCard review={privateReview} />);
    
    expect(getByText('👥')).toBeTruthy();
  });

  it('displays correct stars for different ratings', () => {
    const threeStarReview: Review = {
      ...mockReview,
      rating: 3,
    };
    
    const { getByText } = render(<ReviewCard review={threeStarReview} />);
    
    // 3 filled stars, 2 empty stars
    expect(getByText('★★★☆☆')).toBeTruthy();
  });

  it('handles null avatar URL with default placeholder', () => {
    const reviewWithoutAvatar: Review = {
      ...mockReview,
      author: {
        ...mockReview.author,
        avatarUrl: null,
      },
    };
    
    const { UNSAFE_getByType } = render(<ReviewCard review={reviewWithoutAvatar} />);
    const images = UNSAFE_getByType('Image');
    
    // Should render with default placeholder
    expect(images).toBeTruthy();
  });
});
