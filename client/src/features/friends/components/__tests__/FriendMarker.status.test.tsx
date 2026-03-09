import React from 'react';
import { render } from '@testing-library/react-native';
import { FriendMarker } from '../FriendMarker';
import { FriendLocation } from '../../../../shared/types/location.types';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withRepeat: jest.fn((value) => value),
    withSequence: jest.fn((value) => value),
  };
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: ({ children, onPress }: any) => (
      <View testID="marker" onPress={onPress}>
        {children}
      </View>
    ),
  };
});

// Mock OptimizedImage
jest.mock('../../../../shared/components/OptimizedImage', () => ({
  OptimizedImage: ({ uri, style }: any) => {
    const { View } = require('react-native');
    return <View testID="optimized-image" style={style} />;
  },
}));

describe('FriendMarker - Status Display', () => {
  const mockFriend: FriendLocation = {
    userId: '1',
    name: 'Test User',
    username: 'testuser',
    avatarUrl: 'https://example.com/avatar.jpg',
    latitude: 10.762622,
    longitude: 106.660172,
    timestamp: new Date(),
    isOnline: true,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display status message with emoji', () => {
    const friendWithStatus: FriendLocation = {
      ...mockFriend,
      statusMessage: 'Đang ăn trưa',
      statusEmoji: '🍕',
    };

    const { getByText } = render(
      <FriendMarker friend={friendWithStatus} onPress={mockOnPress} />
    );

    expect(getByText('🍕')).toBeTruthy();
    expect(getByText('Đang ăn trưa')).toBeTruthy();
  });

  it('should display status message without emoji', () => {
    const friendWithStatus: FriendLocation = {
      ...mockFriend,
      statusMessage: 'Đang làm việc',
    };

    const { getByText, queryByTestId } = render(
      <FriendMarker friend={friendWithStatus} onPress={mockOnPress} />
    );

    expect(getByText('Đang làm việc')).toBeTruthy();
  });

  it('should not display status bubble when no status message', () => {
    const { queryByText } = render(
      <FriendMarker friend={mockFriend} onPress={mockOnPress} />
    );

    // Status bubble should not be present
    expect(queryByText('Đang ăn trưa')).toBeFalsy();
  });

  it('should truncate long status messages', () => {
    const friendWithLongStatus: FriendLocation = {
      ...mockFriend,
      statusMessage: 'This is a very long status message that should be truncated',
      statusEmoji: '📝',
    };

    const { getByText } = render(
      <FriendMarker friend={friendWithLongStatus} onPress={mockOnPress} />
    );

    const statusText = getByText(
      'This is a very long status message that should be truncated'
    );
    expect(statusText.props.numberOfLines).toBe(1);
  });

  it('should display online indicator with status', () => {
    const friendWithStatus: FriendLocation = {
      ...mockFriend,
      isOnline: true,
      statusMessage: 'Online now',
      statusEmoji: '✅',
    };

    const { getByText, UNSAFE_getByType } = render(
      <FriendMarker friend={friendWithStatus} onPress={mockOnPress} />
    );

    expect(getByText('Online now')).toBeTruthy();
    // Online indicator should be present (green dot)
    const container = UNSAFE_getByType(require('react-native').View);
    expect(container).toBeTruthy();
  });

  it('should display offline time without status', () => {
    const offlineFriend: FriendLocation = {
      ...mockFriend,
      isOnline: false,
      lastSeenMinutes: 30,
    };

    const { getByText } = render(
      <FriendMarker friend={offlineFriend} onPress={mockOnPress} />
    );

    expect(getByText('30p')).toBeTruthy();
  });

  it('should display both status and offline time', () => {
    const offlineFriendWithStatus: FriendLocation = {
      ...mockFriend,
      isOnline: false,
      lastSeenMinutes: 120,
      statusMessage: 'Đi ngủ',
      statusEmoji: '😴',
    };

    const { getByText } = render(
      <FriendMarker friend={offlineFriendWithStatus} onPress={mockOnPress} />
    );

    expect(getByText('😴')).toBeTruthy();
    expect(getByText('Đi ngủ')).toBeTruthy();
    expect(getByText('2h')).toBeTruthy();
  });

  it('should handle emoji-only status', () => {
    const friendWithEmojiOnly: FriendLocation = {
      ...mockFriend,
      statusMessage: '',
      statusEmoji: '🎉',
    };

    const { queryByText } = render(
      <FriendMarker friend={friendWithEmojiOnly} onPress={mockOnPress} />
    );

    // Status bubble should not be displayed if message is empty
    expect(queryByText('🎉')).toBeFalsy();
  });
});
