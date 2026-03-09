import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CloseFriendsManager } from '../CloseFriendsManager';
import { friendshipService } from '../../../../services/friendship/friendship.service';

// Mock ToastContext
const mockShowToast = jest.fn();
jest.mock('../../../../shared/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
    hideToast: jest.fn(),
  }),
}));

// Mock services
jest.mock('../../../../services/friendship/friendship.service');
jest.mock('../../../../services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock OptimizedImage
jest.mock('../../../../shared/components/OptimizedImage', () => ({
  OptimizedImage: () => {
    const { View } = require('react-native');
    return <View testID="optimized-image" />;
  },
}));

const mockFriends = [
  {
    id: 'friend-1',
    nickName: 'Friend One',
    username: 'friend1',
    avatarUrl: 'https://example.com/avatar1.jpg',
  },
  {
    id: 'friend-2',
    nickName: 'Friend Two',
    username: 'friend2',
    avatarUrl: 'https://example.com/avatar2.jpg',
  },
  {
    id: 'friend-3',
    nickName: 'Friend Three',
    username: 'friend3',
    avatarUrl: 'https://example.com/avatar3.jpg',
  },
];

describe('CloseFriendsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (friendshipService.getFriends as jest.Mock).mockResolvedValue(mockFriends);
  });

  const renderComponent = (props = {}) => {
    return render(
      <CloseFriendsManager
        visible={true}
        onClose={jest.fn()}
        closeFriendIds={[]}
        onUpdate={jest.fn()}
        {...props}
      />
    );
  };

  it('should render close friends manager', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Bạn thân')).toBeTruthy();
    });
  });

  it('should load friends list on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(friendshipService.getFriends).toHaveBeenCalled();
    });
  });

  it('should display friends list', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Friend One')).toBeTruthy();
      expect(getByText('@friend1')).toBeTruthy();
      expect(getByText('Friend Two')).toBeTruthy();
      expect(getByText('Friend Three')).toBeTruthy();
    });
  });

  it('should show selected count', async () => {
    const { getByText } = renderComponent({
      closeFriendIds: ['friend-1', 'friend-2'],
    });

    await waitFor(() => {
      const text = getByText(/Đã chọn/);
      expect(text).toBeTruthy();
    });
  });

  it('should toggle friend selection', async () => {
    const { getByText, getAllByRole } = renderComponent();

    await waitFor(() => {
      expect(getByText('Friend One')).toBeTruthy();
    });

    const switches = getAllByRole('switch');
    fireEvent(switches[0], 'valueChange', true);

    expect(switches[0].props.value).toBe(true);
  });

  it('should select all friends', async () => {
    const { getByText, getAllByRole } = renderComponent();

    await waitFor(() => {
      expect(getByText('Chọn tất cả')).toBeTruthy();
    });

    const selectAllButton = getByText('Chọn tất cả');
    fireEvent.press(selectAllButton);

    const switches = getAllByRole('switch');
    switches.forEach((switchElement: any) => {
      expect(switchElement.props.value).toBe(true);
    });
  });

  it('should deselect all friends', async () => {
    const { getByText, getAllByRole } = renderComponent({
      closeFriendIds: ['friend-1', 'friend-2', 'friend-3'],
    });

    await waitFor(() => {
      expect(getByText('Bỏ chọn tất cả')).toBeTruthy();
    });

    const deselectAllButton = getByText('Bỏ chọn tất cả');
    fireEvent.press(deselectAllButton);

    const switches = getAllByRole('switch');
    switches.forEach((switchElement: any) => {
      expect(switchElement.props.value).toBe(false);
    });
  });

  it('should save selected friends', async () => {
    const mockOnUpdate = jest.fn();
    const { getByText, getAllByRole } = renderComponent({
      onUpdate: mockOnUpdate,
    });

    await waitFor(() => {
      expect(getByText('Friend One')).toBeTruthy();
    });

    const switches = getAllByRole('switch');
    fireEvent(switches[0], 'valueChange', true);

    const saveButton = getByText('Lưu');
    fireEvent.press(saveButton);

    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('should close on cancel', async () => {
    const mockOnClose = jest.fn();
    const { getByText } = renderComponent({
      onClose: mockOnClose,
    });

    await waitFor(() => {
      expect(getByText('Hủy')).toBeTruthy();
    });

    const cancelButton = getByText('Hủy');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show empty state when no friends', async () => {
    (friendshipService.getFriends as jest.Mock).mockResolvedValue([]);

    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText('Chưa có bạn bè')).toBeTruthy();
    });
  });

  it('should show loading state', () => {
    const { getByText } = renderComponent();

    expect(getByText('Đang tải...')).toBeTruthy();
  });

  it('should handle load friends error', async () => {
    (friendshipService.getFriends as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    renderComponent();

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Không thể tải danh sách bạn bè',
        'error'
      );
    });
  });
});
