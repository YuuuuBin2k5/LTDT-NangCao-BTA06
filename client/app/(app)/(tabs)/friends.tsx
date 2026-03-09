import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useUserSearch } from "../../../src/features/profile/hooks/useUserSearch";
import { useFriendshipActions } from "../../../src/features/profile/hooks/useFriendshipActions";
import { UserListItem } from "../../../src/features/profile/components/UserListItem";
import { FriendAction, FriendshipStatus } from "../../../src/shared/types/friendship.types";
import { friendshipService } from "../../../src/services/friendship/friendship.service";
import type { FriendUser } from "../../../src/shared/types/friendship.types";

// Fixed height for UserListItem for performance optimization
const ITEM_HEIGHT = 75;

type TabType = 'friends' | 'requests' | 'search';

/**
 * FriendsScreen - User search and friendship management
 * 
 * Improved UX:
 * 1. Default view: Shows friends list
 * 2. Tab navigation: Friends / Friend Requests
 * 3. Search button: Opens search mode
 */
export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendUser[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Search functionality
  const {
    users: searchResults,
    isLoading: isSearching,
    error: searchError,
    searchKeyword,
    setSearchKeyword,
    refresh: refreshSearch,
  } = useUserSearch();

  const {
    sendFriendRequest,
    cancelRequest,
    unfriend,
    acceptRequest,
    rejectRequest,
    isLoading: actionLoading,
  } = useFriendshipActions();

  // Load friends list
  const loadFriends = useCallback(async () => {
    setIsLoadingFriends(true);
    try {
      const data = await friendshipService.getFriends();
      setFriends(data);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setIsLoadingFriends(false);
    }
  }, []);

  // Load friend requests
  const loadRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const data = await friendshipService.getFriendRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  // Refresh data after actions
  const refreshData = useCallback(() => {
    loadFriends();
    loadRequests();
    if (activeTab === 'search') {
      refreshSearch();
    }
  }, [activeTab, loadFriends, loadRequests, refreshSearch]);

  // Handle friend actions
  const handleFriendAction = useCallback(async (
    userId: number,
    action: FriendAction,
    friendshipId: number | null
  ) => {
    try {
      switch (action) {
        case FriendAction.ADD_FRIEND:
          await sendFriendRequest(userId);
          break;
        case FriendAction.CANCEL_REQUEST:
          if (friendshipId) await cancelRequest(friendshipId);
          break;
        case FriendAction.UNFRIEND:
          if (friendshipId) await unfriend(friendshipId);
          break;
        case FriendAction.ACCEPT_REQUEST:
          if (friendshipId) await acceptRequest(friendshipId);
          break;
        case FriendAction.REJECT_REQUEST:
          if (friendshipId) await rejectRequest(friendshipId);
          break;
      }
      refreshData();
    } catch (err) {
      console.error("Friend action failed:", err);
    }
  }, [sendFriendRequest, cancelRequest, unfriend, acceptRequest, rejectRequest, refreshData]);

  // Get current list based on active tab
  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'friends':
        // Convert FriendUser to UserSearchResult format for friends
        return friends.map(friend => ({
          id: parseInt(friend.id, 16), // Convert UUID string to number (hash)
          name: friend.name,
          username: friend.username,
          avatarUrl: friend.avatarUrl,
          friendshipStatus: (friend.friendshipStatus || FriendshipStatus.ACCEPTED) as FriendshipStatus,
          friendshipId: friend.friendshipId || null,
        }));
      case 'requests':
        // Convert FriendUser to UserSearchResult format for requests
        return requests.map(request => ({
          id: parseInt(request.id, 16), // Convert UUID string to number (hash)
          name: request.name,
          username: request.username,
          avatarUrl: request.avatarUrl,
          friendshipStatus: (request.friendshipStatus || FriendshipStatus.PENDING) as FriendshipStatus,
          friendshipId: request.friendshipId || null,
        }));
      case 'search':
        return searchResults;
      default:
        return [];
    }
  }, [activeTab, friends, requests, searchResults]);

  const isLoading = activeTab === 'friends' ? isLoadingFriends 
    : activeTab === 'requests' ? isLoadingRequests 
    : isSearching;

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) return null;

    if (activeTab === 'friends') {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>Chưa có bạn bè</Text>
          <Text style={styles.emptySubtext}>Nhấn nút "Tìm bạn bè" để kết nối</Text>
        </View>
      );
    }

    if (activeTab === 'requests') {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📬</Text>
          <Text style={styles.emptyText}>Không có lời mời kết bạn</Text>
        </View>
      );
    }

    if (activeTab === 'search') {
      if (searchKeyword.trim() === "") {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Nhập tên để tìm kiếm</Text>
          </View>
        );
      }
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👥 Bạn bè</Text>
        
        {/* Search button */}
        {activeTab !== 'search' && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setActiveTab('search')}
          >
            <Text style={styles.searchButtonText}>🔍 Tìm bạn bè</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search bar (only in search mode) */}
      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveTab('friends');
              setSearchKeyword('');
            }}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm người dùng..."
            placeholderTextColor="#999"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </View>
      )}

      {/* Tabs (only when not in search mode) */}
      {activeTab !== 'search' && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Bạn bè ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Lời mời ({requests.length})
            </Text>
            {requests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{requests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {/* User list */}
      {!isLoading && (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              onFriendAction={handleFriendAction}
              isLoading={actionLoading}
              context={activeTab}
            />
          )}
          getItemLayout={(_data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          windowSize={21}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            currentList.length === 0 ? styles.emptyListContainer : undefined,
            { paddingBottom: 80 }
          ]}
          refreshing={isLoading}
          onRefresh={refreshData}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
});
