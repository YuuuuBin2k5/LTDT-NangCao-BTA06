import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PostCard } from '../PostCard';
import { Post, PostPrivacy } from '../../types/post.types';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('PostCard', () => {
  const mockPost: Post = {
    id: 1,
    user: {
      id: 'user-123',
      username: 'johndoe',
      nickName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    content: 'Beautiful sunset at the beach! #sunset #beach',
    latitude: 10.762622,
    longitude: 106.660172,
    locationName: 'Bãi biển Vũng Tàu',
    privacy: PostPrivacy.PUBLIC,
    images: [
      {
        id: 1,
        imageUrl: 'https://example.com/image1.jpg',
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        displayOrder: 0,
      },
    ],
    likeCount: 42,
    commentCount: 15,
    isLiked: true,
    viewCount: 234,
    hashtags: ['sunset', 'beach'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders post content correctly', () => {
    const { getByText } = render(
      <PostCard post={mockPost} onPress={jest.fn()} />
    );

    expect(getByText(/Beautiful sunset at the beach!/)).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('displays user avatar', () => {
    const { UNSAFE_getAllByType } = render(
      <PostCard post={mockPost} onPress={jest.fn()} />
    );

    const images = UNSAFE_getAllByType('Image');
    expect(images.length).toBeGreaterThan(0);
  });

  it('displays post image when available', () => {
    const { UNSAFE_getAllByType } = render(
      <PostCard post={mockPost} onPress={jest.fn()} />
    );

    const images = UNSAFE_getAllByType('Image');
    // Should have at least 2 images: post image and avatar
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it('displays location name when available', () => {
    const { getByText } = render(
      <PostCard post={mockPost} onPress={jest.fn()} />
    );

    expect(getByText(/Bãi biển Vũng Tàu/)).toBeTruthy();
  });

  it('displays correct stats (likes, comments, views)', () => {
    const { getByText } = render(
      <PostCard post={mockPost} onPress={jest.fn()} />
    );

    expect(getByText(/42/)).toBeTruthy(); // likes
    expect(getByText(/15/)).toBeTruthy(); // comments
    expect(getByText(/234/)).toBeTruthy(); // views
  });

  it('shows multiple images badge when post has multiple images', () => {
    const postWithMultipleImages: Post = {
      ...mockPost,
      images: [
        {
          id: 1,
          imageUrl: 'https://example.com/image1.jpg',
          thumbnailUrl: 'https://example.com/thumb1.jpg',
          displayOrder: 0,
        },
        {
          id: 2,
          imageUrl: 'https://example.com/image2.jpg',
          thumbnailUrl: 'https://example.com/thumb2.jpg',
          displayOrder: 1,
        },
        {
          id: 3,
          imageUrl: 'https://example.com/image3.jpg',
          thumbnailUrl: 'https://example.com/thumb3.jpg',
          displayOrder: 2,
        },
      ],
    };

    const { getByText } = render(
      <PostCard post={postWithMultipleImages} onPress={jest.fn()} />
    );

    // Should show "+2" badge (3 images - 1 displayed = 2 more)
    expect(getByText('+2')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PostCard post={mockPost} onPress={onPressMock} />
    );

    const card = getByText('John Doe').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
      expect(onPressMock).toHaveBeenCalledWith(mockPost);
    }
  });

  it('renders without image when post has no images', () => {
    const postWithoutImage: Post = {
      ...mockPost,
      images: [],
    };

    const { queryByText, getByText } = render(
      <PostCard post={postWithoutImage} onPress={jest.fn()} />
    );

    // Should still render content
    expect(getByText(/Beautiful sunset at the beach!/)).toBeTruthy();
    // Should not show multiple images badge
    expect(queryByText(/\+\d+/)).toBeNull();
  });

  it('renders without location when locationName is not provided', () => {
    const postWithoutLocation: Post = {
      ...mockPost,
      locationName: undefined,
    };

    const { queryByText } = render(
      <PostCard post={postWithoutLocation} onPress={jest.fn()} />
    );

    // Should not display location
    expect(queryByText(/📍/)).toBeNull();
  });

  it('displays hashtags in content', () => {
    const { getByText } = render(
      <PostCard post={mockPost} onPress={jest.fn()} />
    );

    // Hashtags should be rendered
    expect(getByText(/#sunset/)).toBeTruthy();
    expect(getByText(/#beach/)).toBeTruthy();
  });
});
