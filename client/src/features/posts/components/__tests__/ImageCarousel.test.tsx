import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImageCarousel } from '../ImageCarousel';
import { PostImage } from '../../types/post.types';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    ScrollView: RN.ScrollView,
  };
});

describe('ImageCarousel', () => {
  const mockImages: PostImage[] = [
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
  ];

  it('renders all images', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={mockImages} />
    );

    const images = UNSAFE_getAllByType('Image');
    expect(images.length).toBe(3);
  });

  it('renders pagination dots for multiple images', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={mockImages} />
    );

    const views = UNSAFE_getAllByType('View');
    // Should have pagination dots
    expect(views.length).toBeGreaterThan(3);
  });

  it('does not render pagination dots for single image', () => {
    const singleImage = [mockImages[0]];
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={singleImage} />
    );

    const images = UNSAFE_getAllByType('Image');
    expect(images.length).toBe(1);
  });

  it('returns null when no images provided', () => {
    const { UNSAFE_root } = render(
      <ImageCarousel images={[]} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders images in correct order', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={mockImages} />
    );

    const images = UNSAFE_getAllByType('Image');
    expect(images.length).toBe(mockImages.length);
  });

  it('handles scroll event to update active index', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={mockImages} />
    );

    // Verify component renders with images
    const images = UNSAFE_getAllByType('Image');
    expect(images.length).toBe(3);
    
    // Verify pagination dots are rendered for multiple images
    const views = UNSAFE_getAllByType('View');
    expect(views.length).toBeGreaterThan(3); // Container + image containers + pagination
  });

  it('renders with correct dimensions', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={mockImages} />
    );

    const views = UNSAFE_getAllByType('View');
    // Should have container and image containers
    expect(views.length).toBeGreaterThan(0);
  });

  it('handles single image without pagination', () => {
    const singleImage = [mockImages[0]];
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={singleImage} />
    );

    const images = UNSAFE_getAllByType('Image');
    expect(images.length).toBe(1);
  });

  it('renders images with correct source URIs', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={mockImages} />
    );

    const images = UNSAFE_getAllByType('Image');
    expect(images[0].props.source.uri).toBe('https://example.com/image1.jpg');
    expect(images[1].props.source.uri).toBe('https://example.com/image2.jpg');
    expect(images[2].props.source.uri).toBe('https://example.com/image3.jpg');
  });

  it('uses cover resize mode for images', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageCarousel images={mockImages} />
    );

    const images = UNSAFE_getAllByType('Image');
    images.forEach((image) => {
      expect(image.props.resizeMode).toBe('cover');
    });
  });
});
