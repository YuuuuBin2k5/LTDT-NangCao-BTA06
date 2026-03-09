import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  PlaceDetails,
  Review,
  locationService,
} from '../../../src/services/location/location.service';
import { ReviewCard } from '../../../src/features/map/components/ReviewCard';
import { AppError } from '../../../src/shared/types/error.types';

/**
 * PlaceHeader component displaying place information
 */
interface PlaceHeaderProps {
  place: PlaceDetails;
}

// Constants for performance optimization
const REVIEW_ITEM_HEIGHT = 140; // Approximate height of ReviewCard

const PlaceHeader: React.FC<PlaceHeaderProps> = ({ place }) => {
  // Format category display
  const formatCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      RESTAURANT: 'Nhà hàng',
      HOTEL: 'Khách sạn',
      PARK: 'Công viên',
      MUSEUM: 'Bảo tàng',
      SHOPPING: 'Mua sắm',
      ENTERTAINMENT: 'Giải trí',
      OTHER: 'Khác',
    };
    return categoryMap[category] || category;
  };

  // Render star rating
  const renderStars = (rating: number): string => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '⯨' : '') + 
           '☆'.repeat(emptyStars);
  };

  // Get default cover image
  const defaultCoverImage = 'https://via.placeholder.com/400x200/e0e0e0/666666?text=No+Image';

  return (
    <View style={styles.headerContainer}>
      {/* Cover Image with expo-image for better caching and lazy loading */}
      <Image
        source={{ uri: place.coverImageUrl || defaultCoverImage }}
        style={styles.coverImage}
        placeholder={{ uri: defaultCoverImage }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      
      {/* Place Info */}
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{formatCategory(place.category)}</Text>
        </View>
        
        {/* Address */}
        <View style={styles.addressRow}>
          <Text style={styles.addressIcon}>📍</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {place.address}
          </Text>
        </View>
        
        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingStars}>{renderStars(place.averageRating)}</Text>
          <Text style={styles.ratingText}>
            {place.averageRating > 0 
              ? `${place.averageRating.toFixed(1)} / 5.0` 
              : 'Chưa có đánh giá'}
          </Text>
        </View>
        
        {/* Description */}
        {place.description && (
          <Text style={styles.description}>{place.description}</Text>
        )}
      </View>
    </View>
  );
};

/**
 * Place Details Screen
 * Displays detailed information about a place and its reviews
 */
export default function PlaceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const placeId = params.id as string;

  // State
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingPlace, setIsLoadingPlace] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [placeError, setPlaceError] = useState<AppError | null>(null);
  const [reviewsError, setReviewsError] = useState<AppError | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch place details and reviews in parallel for better performance
   */
  const fetchData = useCallback(async () => {
    if (!placeId) return;

    try {
      setIsLoadingPlace(true);
      setIsLoadingReviews(true);
      setPlaceError(null);
      setReviewsError(null);
      
      // Parallel loading using Promise.all for better performance
      const [placeData, reviewsData] = await Promise.all([
        locationService.fetchPlaceDetails(Number(placeId)),
        locationService.fetchPlaceReviews(Number(placeId))
      ]);
      
      setPlace(placeData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Set error for both if parallel fetch fails
      const appError = error as AppError;
      setPlaceError(appError);
      setReviewsError(appError);
    } finally {
      setIsLoadingPlace(false);
      setIsLoadingReviews(false);
    }
  }, [placeId]);

  /**
   * Fetch place details only
   */
  const fetchPlaceDetails = useCallback(async () => {
    if (!placeId) return;

    try {
      setIsLoadingPlace(true);
      setPlaceError(null);
      
      const placeData = await locationService.fetchPlaceDetails(Number(placeId));
      setPlace(placeData);
    } catch (error) {
      console.error('Failed to fetch place details:', error);
      setPlaceError(error as AppError);
    } finally {
      setIsLoadingPlace(false);
    }
  }, [placeId]);

  /**
   * Fetch place reviews only
   */
  const fetchReviews = useCallback(async () => {
    if (!placeId) return;

    try {
      setIsLoadingReviews(true);
      setReviewsError(null);
      
      const reviewsData = await locationService.fetchPlaceReviews(Number(placeId));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setReviewsError(error as AppError);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [placeId]);

  /**
   * Load data on mount using parallel loading
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handle pull-to-refresh using parallel loading
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  /**
   * Handle retry for place details
   */
  const handleRetryPlace = useCallback(() => {
    fetchPlaceDetails();
  }, [fetchPlaceDetails]);

  /**
   * Handle retry for reviews
   */
  const handleRetryReviews = useCallback(() => {
    fetchReviews();
  }, [fetchReviews]);

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * Get item layout for FlatList optimization
   * Improves scrolling performance by providing fixed item heights
   */
  const getItemLayout = useCallback(
    (_data: ArrayLike<Review> | null | undefined, index: number) => ({
      length: REVIEW_ITEM_HEIGHT,
      offset: REVIEW_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  /**
   * Render review item with memoization
   */
  const renderReviewItem = useCallback(
    ({ item }: { item: Review }) => <ReviewCard review={item} />,
    []
  );

  // Render loading state for place info
  if (isLoadingPlace && !place) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải thông tin địa điểm...</Text>
        </View>
      </View>
    );
  }

  // Render error state for place info
  if (placeError && !place) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Không thể tải thông tin</Text>
          <Text style={styles.errorMessage}>{placeError.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetryPlace}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#007AFF"
        />
      }
    >
      {/* Place Header Section */}
      {place && <PlaceHeader place={place} />}

      {/* Visual Separator */}
      <View style={styles.separator} />

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsTitle}>Đánh giá</Text>

        {/* Loading state for reviews */}
        {isLoadingReviews && (
          <View style={styles.reviewsLoadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.reviewsLoadingText}>Đang tải đánh giá...</Text>
          </View>
        )}

        {/* Error state for reviews */}
        {reviewsError && !isLoadingReviews && (
          <View style={styles.reviewsErrorContainer}>
            <Text style={styles.reviewsErrorText}>❌ {reviewsError.message}</Text>
            <TouchableOpacity style={styles.retryButtonSmall} onPress={handleRetryReviews}>
              <Text style={styles.retryButtonTextSmall}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state for reviews */}
        {!isLoadingReviews && !reviewsError && reviews.length === 0 && (
          <View style={styles.emptyReviewsContainer}>
            <Text style={styles.emptyReviewsIcon}>💬</Text>
            <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào</Text>
            <Text style={styles.emptyReviewsSubtext}>
              Hãy là người đầu tiên đánh giá địa điểm này!
            </Text>
          </View>
        )}

        {/* Reviews List using FlatList with performance optimizations */}
        {!isLoadingReviews && !reviewsError && reviews.length > 0 && (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReviewItem}
            getItemLayout={getItemLayout}
            scrollEnabled={false}
            contentContainerStyle={styles.reviewsListContent}
            ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={5}
            windowSize={10}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  placeInfo: {
    padding: 16,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d32',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingStars: {
    fontSize: 18,
    color: '#FFB800',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  separator: {
    height: 8,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewsSection: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 32,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  reviewsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  reviewsLoadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  reviewsErrorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  reviewsErrorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButtonSmall: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonTextSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyReviewsContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyReviewsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  reviewsListContent: {
    paddingBottom: 16,
  },
  reviewSeparator: {
    height: 0,
  },
});
