import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CommentList } from '../CommentList';
import { Comment } from '../../types/post.types';

describe('CommentList', () => {
  const mockComments: Comment[] = [
    {
      id: 1,
      postId: 1,
      user: {
        id: 'user-1',
        username: 'johndoe',
        nickName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
      },
      content: 'Great post!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      postId: 1,
      user: {
        id: 'user-2',
        username: 'janedoe',
        nickName: 'Jane Doe',
        avatarUrl: 'https://example.com/avatar2.jpg',
      },
      content: 'Amazing photos!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('renders list of comments', () => {
    const { getByText } = render(
      <CommentList comments={mockComments} />
    );

    expect(getByText('Great post!')).toBeTruthy();
    expect(getByText('Amazing photos!')).toBeTruthy();
  });

  it('displays user names for each comment', () => {
    const { getByText } = render(
      <CommentList comments={mockComments} />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Doe')).toBeTruthy();
  });

  it('displays user avatars', () => {
    const { UNSAFE_getAllByType } = render(
      <CommentList comments={mockComments} />
    );

    const images = UNSAFE_getAllByType('Image');
    // Should have 2 avatars
    expect(images.length).toBe(2);
  });

  it('shows empty state when no comments', () => {
    const { getByText } = render(
      <CommentList comments={[]} />
    );

    expect(getByText('Chưa có bình luận nào')).toBeTruthy();
  });

  it('shows delete button for comment owner', () => {
    const { getByText } = render(
      <CommentList
        comments={mockComments}
        currentUserId="user-1"
        onDeleteComment={jest.fn()}
      />
    );

    // Should show delete button for first comment (owned by user-1)
    expect(getByText('Xóa')).toBeTruthy();
  });

  it('does not show delete button for non-owner comments', () => {
    const { queryAllByText } = render(
      <CommentList
        comments={mockComments}
        currentUserId="user-1"
        onDeleteComment={jest.fn()}
      />
    );

    const deleteButtons = queryAllByText('Xóa');
    // Should only have 1 delete button (for user-1's comment)
    expect(deleteButtons.length).toBe(1);
  });

  it('calls onDeleteComment when delete button is pressed', () => {
    const onDeleteMock = jest.fn();
    const { getByText } = render(
      <CommentList
        comments={mockComments}
        currentUserId="user-1"
        onDeleteComment={onDeleteMock}
      />
    );

    const deleteButton = getByText('Xóa');
    fireEvent.press(deleteButton);

    expect(onDeleteMock).toHaveBeenCalledWith(1);
  });

  it('does not show delete button when onDeleteComment is not provided', () => {
    const { queryByText } = render(
      <CommentList
        comments={mockComments}
        currentUserId="user-1"
      />
    );

    expect(queryByText('Xóa')).toBeNull();
  });

  it('renders comments without avatars', () => {
    const commentsWithoutAvatars: Comment[] = [
      {
        ...mockComments[0],
        user: {
          ...mockComments[0].user,
          avatarUrl: undefined,
        },
      },
    ];

    const { getByText } = render(
      <CommentList comments={commentsWithoutAvatars} />
    );

    // Should still render comment content
    expect(getByText('Great post!')).toBeTruthy();
  });

  it('displays time ago for comments', () => {
    const { getAllByText } = render(
      <CommentList comments={mockComments} />
    );

    // Should display "Vừa xong" for recent comments (multiple times for multiple comments)
    const timeElements = getAllByText('Vừa xong');
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('handles multiple comments from same user', () => {
    const sameUserComments: Comment[] = [
      mockComments[0],
      {
        ...mockComments[0],
        id: 3,
        content: 'Another comment from same user',
      },
    ];

    const { getByText } = render(
      <CommentList
        comments={sameUserComments}
        currentUserId="user-1"
        onDeleteComment={jest.fn()}
      />
    );

    expect(getByText('Great post!')).toBeTruthy();
    expect(getByText('Another comment from same user')).toBeTruthy();
  });
});
