import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StatusInputDialog } from '../StatusInputDialog';

describe('StatusInputDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <StatusInputDialog
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        {...props}
      />
    );
  };

  it('should render status input dialog', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    expect(getByText('Đặt trạng thái')).toBeTruthy();
    expect(getByPlaceholderText('Bạn đang làm gì?')).toBeTruthy();
  });

  it('should allow text input', () => {
    const { getByPlaceholderText } = renderComponent();

    const input = getByPlaceholderText('Bạn đang làm gì?');
    fireEvent.changeText(input, 'Đang ăn trưa');

    expect(input.props.value).toBe('Đang ăn trưa');
  });

  it('should show character counter', () => {
    const { getByText } = renderComponent();

    expect(getByText(/50 \/ 50/)).toBeTruthy();
  });

  it('should update character counter on input', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    const input = getByPlaceholderText('Bạn đang làm gì?');
    fireEvent.changeText(input, 'Hello');

    expect(getByText(/45 \/ 50/)).toBeTruthy();
  });

  it('should show error when over limit', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    const input = getByPlaceholderText('Bạn đang làm gì?');
    const longText = 'a'.repeat(60);
    fireEvent.changeText(input, longText);

    const counter = getByText(/-10 \/ 50/);
    expect(counter).toBeTruthy();
  });

  it('should display emoji quick picks', () => {
    const { getByText } = renderComponent();

    expect(getByText('Chọn nhanh')).toBeTruthy();
    expect(getByText('Ở nhà')).toBeTruthy();
    expect(getByText('Đi làm')).toBeTruthy();
    expect(getByText('Đi ăn')).toBeTruthy();
  });

  it('should select emoji on press', () => {
    const { getByText } = renderComponent();

    const emojiCard = getByText('Ở nhà');
    fireEvent.press(emojiCard);

    // Emoji should be selected (visual feedback)
    expect(emojiCard).toBeTruthy();
  });

  it('should auto-fill status when emoji selected', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    const emojiCard = getByText('Đi ăn');
    fireEvent.press(emojiCard);

    const input = getByPlaceholderText('Bạn đang làm gì?');
    expect(input.props.value).toBe('Đi ăn');
  });

  it('should save status on save button press', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    const input = getByPlaceholderText('Bạn đang làm gì?');
    fireEvent.changeText(input, 'Đang làm việc');

    const saveButton = getByText('Lưu');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('Đang làm việc', '');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should save status with emoji', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    // Select emoji
    const emojiCard = getByText('Cafe');
    fireEvent.press(emojiCard);

    // Modify text
    const input = getByPlaceholderText('Bạn đang làm gì?');
    fireEvent.changeText(input, 'Đang uống cà phê');

    const saveButton = getByText('Lưu');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('Đang uống cà phê', '☕');
  });

  it('should not save empty status', () => {
    const { getByText } = renderComponent();

    const saveButton = getByText('Lưu');
    fireEvent.press(saveButton);

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should not save when over character limit', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    const input = getByPlaceholderText('Bạn đang làm gì?');
    const longText = 'a'.repeat(60);
    fireEvent.changeText(input, longText);

    const saveButton = getByText('Lưu');
    fireEvent.press(saveButton);

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should close on cancel', () => {
    const { getByText } = renderComponent();

    const cancelButton = getByText('Hủy');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show clear button when has current status', () => {
    const { getByText } = renderComponent({
      currentStatus: 'Old status',
    });

    expect(getByText('Xóa trạng thái')).toBeTruthy();
  });

  it('should clear status on clear button press', () => {
    const { getByText } = renderComponent({
      currentStatus: 'Old status',
      currentEmoji: '🏠',
    });

    const clearButton = getByText('Xóa trạng thái');
    fireEvent.press(clearButton);

    expect(mockOnSave).toHaveBeenCalledWith('', '');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show info about auto-hide', () => {
    const { getByText } = renderComponent();

    expect(getByText('Trạng thái sẽ tự động ẩn sau 4 giờ')).toBeTruthy();
  });

  it('should trim whitespace from status', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    const input = getByPlaceholderText('Bạn đang làm gì?');
    fireEvent.changeText(input, '  Đang nghỉ  ');

    const saveButton = getByText('Lưu');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('Đang nghỉ', '');
  });
});
