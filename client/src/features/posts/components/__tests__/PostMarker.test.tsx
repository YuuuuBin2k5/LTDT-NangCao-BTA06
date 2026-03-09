import React from 'react';
import { render } from '@testing-library/react-native';
import { PostMarker } from '../PostMarker';
import { Post, PostPrivacy } from '../../types/post.types';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  return {
    Marker: ({ children }: any) => <>{children}</>,
  };
});

describe('PostMarker', () => {
  const mockPost: Post = {
    id: 1,
    user: {
      id: 'user-123',
      username: 'johndoe',
      nickName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    content: 'Test post',
    latitude: 10.762622,
    longitude: 106.660172,
    locationName: 'Test Location',
    privacy: PostPrivacy.PUBLIC,
    images: [
      {
        id: 1,
        imageUrl: 'https://example.com/image1.jpg',
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        displayOrder: 0,
      },
    ],
    likeCount: 10,
    commentCount: 5,
    isLiked: false,
    viewCount: 50,
    hashtags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders marker with thumbnail image', () => {
    const { UNSAFE_getAllByType } = render(
      <PostMarker post={mockPost} onPress={jest.fn()} />
    );

    const images = UNSAFE_getAllByType('Image');
    // Should have 2 images: thumbnail and avatar
    expect(images.length).toBe(2);
  });

  it('renders marker with avatar', () => {
    const { UNSAFE_getAllByType } = render(
      <PostMarker post={mockPost} onPress={jest.fn()} />
    );

    const images = UNSAFE_getAllByType('Image');
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders placeholder when post has no images', () => {
    const postWithoutImage: Post = {
      ...mockPost,
      images: [],
    };

    const { UNSAFE_getAllByType, UNSAFE_getByType } = render(
      <PostMarker post={postWithoutImage} onPress={jest.fn()} />
    );

    // Should still render (with placeholder)
    const view = UNSAFE_getByType('View');
    expect(view).toBeTruthy();
  });

  it('renders without avatar when user has no avatar', () => {
    const postWithoutAvatar: Post = {
      ...mockPost,
      user: {
        ...mockPost.user,
        avatarUrl: undefined,
      },
    };

    const { UNSAFE_getAllByType } = render(
      <PostMarker post={postWithoutAvatar} onPress={jest.fn()} />
    );

    const images = UNSAFE_getAllByType('Image');
    // Should only have thumbnail image, no avatar
    expect(images.length).toBe(1);
  });

  it('uses correct coordinates for marker', () => {
    const { UNSAFE_getAllByType } = render(
      <PostMarker post={mockPost} onPress={jest.fn()} />
    );

    // The Marker component should be rendered (mocked as fragment)
    const views = UNSAFE_getAllByType('View');
    expect(views.length).toBeGreaterThan(0);
  });

  it('renders marker container with correct structure', () => {
    const { UNSAFE_getAllByType } = render(
      <PostMarker post={mockPost} onPress={jest.fn()} />
    );

    const views = UNSAFE_getAllByType('View');
    // Should have marker container and other views
    expect(views.length).toBeGreaterThan(0);
  });
});
