import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Button } from '../../../shared/components/Button';
import { OptimizedImage } from '../../../shared/components/OptimizedImage';
import { UserSearchResult, FriendshipStatus, FriendAction } from '../../../shared/types';

export interface UserListItemProps {
  user: UserSearchResult;
  onFriendAction: (userId: number, action: FriendAction, friendshipId: number | null) => void;
  isLoading?: boolean;
  context?: 'search' | 'friends' | 'requests'; // Context to determine button behavior
}

/**
 * UserListItem component displays a user in search results with their avatar,
 * name, username, and an action button based on friendship status.
 */
export const UserListItem = React.memo<UserListItemProps>(({ user, onFriendAction, isLoading = false, context = 'search' }) => {
  const { id, name, username, avatarUrl, friendshipStatus, friendshipId } = user;

  // Determine button properties based on friendship status and context
  const getButtonProps = () => {
    // If in requests context, show Accept/Reject buttons
    if (context === 'requests' && friendshipStatus === FriendshipStatus.PENDING) {
      return {
        title: 'Chấp nhận',
        action: FriendAction.ACCEPT_REQUEST,
        variant: 'primary' as const,
      };
    }
    
    // If in friends context, show Unfriend button
    if (context === 'friends' && friendshipStatus === FriendshipStatus.ACCEPTED) {
      return {
        title: 'Hủy kết bạn',
        action: FriendAction.UNFRIEND,
        variant: 'outline' as const,
      };
    }
    
    // For search context, use original logic
    if (friendshipStatus === FriendshipStatus.PENDING) {
      return {
        title: 'Hủy lời mời',
        action: FriendAction.CANCEL_REQUEST,
        variant: 'outline' as const,
      };
    } else if (friendshipStatus === FriendshipStatus.ACCEPTED) {
      return {
        title: 'Hủy kết bạn',
        action: FriendAction.UNFRIEND,
        variant: 'outline' as const,
      };
    } else {
      // null, REJECTED, or BLOCKED - show Add Friend
      return {
        title: 'Kết bạn',
        action: FriendAction.ADD_FRIEND,
        variant: 'primary' as const,
      };
    }
  };

  const buttonProps = getButtonProps();

  const handlePress = () => {
    onFriendAction(id, buttonProps.action, friendshipId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <OptimizedImage
          uri={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'}
          style={styles.avatar}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          @{username}
        </Text>
      </View>

      <View style={styles.actionContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#2ecc71" />
        ) : (
          <Button
            title={buttonProps.title}
            onPress={handlePress}
            variant={buttonProps.variant}
            size="small"
            disabled={isLoading}
          />
        )}
      </View>
    </View>
  );
});

UserListItem.displayName = 'UserListItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    minWidth: 100,
    alignItems: 'flex-end',
  },
});
