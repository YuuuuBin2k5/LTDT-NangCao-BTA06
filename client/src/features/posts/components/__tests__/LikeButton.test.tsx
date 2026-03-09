import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LikeButton } from '../LikeButton';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

describe('LikeButton', () => {
  it('renders with correct like count', () => {
    const { getByText } = render(
      <LikeButton isLiked={false} likeCount={42} onToggle={jest.fn()} />
    );

    expect(getByText('42')).toBeTruthy();
  });

  it('displays empty heart when not liked', () => {
    const { getByText } = render(
      <LikeButton isLiked={false} likeCount={10} onToggle={jest.fn()} />
    );

    expect(getByText('🤍')).toBeTruthy();
  });

  it('displays filled heart when liked', () => {
    const { getByText } = render(
      <LikeButton isLiked={true} likeCount={10} onToggle={jest.fn()} />
    );

    expect(getByText('❤️')).toBeTruthy();
  });

  it('calls onToggle when pressed', async () => {
    const onToggleMock = jest.fn().mockResolvedValue(undefined);
    const { getByText } = render(
      <LikeButton isLiked={false} likeCount={10} onToggle={onToggleMock} />
    );

    const button = getByText('🤍').parent;
    if (button) {
      fireEvent.press(button);
      await waitFor(() => {
        expect(onToggleMock).toHaveBeenCalled();
      });
    }
  });

  it('updates like count when toggled', () => {
    const { getByText, rerender } = render(
      <LikeButton isLiked={false} likeCount={10} onToggle={jest.fn()} />
    );

    expect(getByText('10')).toBeTruthy();

    // Simulate like count increase
    rerender(
      <LikeButton isLiked={true} likeCount={11} onToggle={jest.fn()} />
    );

    expect(getByText('11')).toBeTruthy();
  });

  it('changes icon when like state changes', () => {
    const { getByText, rerender } = render(
      <LikeButton isLiked={false} likeCount={10} onToggle={jest.fn()} />
    );

    expect(getByText('🤍')).toBeTruthy();

    // Simulate like
    rerender(
      <LikeButton isLiked={true} likeCount={11} onToggle={jest.fn()} />
    );

    expect(getByText('❤️')).toBeTruthy();
  });

  it('disables button while animating', async () => {
    const onToggleMock = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { getByText } = render(
      <LikeButton isLiked={false} likeCount={10} onToggle={onToggleMock} />
    );

    const button = getByText('🤍').parent;
    if (button) {
      fireEvent.press(button);
      
      // Button should be disabled during animation
      fireEvent.press(button);
      
      await waitFor(() => {
        // Should only be called once despite multiple presses
        expect(onToggleMock).toHaveBeenCalledTimes(1);
      });
    }
  });

  it('displays zero like count correctly', () => {
    const { getByText } = render(
      <LikeButton isLiked={false} likeCount={0} onToggle={jest.fn()} />
    );

    expect(getByText('0')).toBeTruthy();
  });

  it('handles large like counts', () => {
    const { getByText } = render(
      <LikeButton isLiked={true} likeCount={9999} onToggle={jest.fn()} />
    );

    expect(getByText('9999')).toBeTruthy();
  });
});
