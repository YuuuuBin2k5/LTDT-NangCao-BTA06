package com.mapic.service;

import com.mapic.dto.feed.FilterConfigDTO;
import com.mapic.dto.feed.FilterType;
import com.mapic.entity.Friendship;
import com.mapic.entity.FriendshipStatus;
import com.mapic.entity.Post;
import com.mapic.entity.PostImage;
import com.mapic.exception.InvalidFilterException;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FilterServiceImpl implements FilterService {

    @Override
    public Specification<Post> buildSpecification(
        List<FilterConfigDTO> filters, 
        UUID userId, 
        Double userLat, 
        Double userLng
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Privacy filter based on user context
            if (userId != null) {
                // User is logged in: show PUBLIC + own posts + FRIENDS_ONLY from friends
                Predicate publicPosts = cb.equal(root.get("privacy"), com.mapic.entity.PostPrivacy.PUBLIC);
                Predicate ownPosts = cb.equal(root.get("user").get("id"), userId);
                
                // FRIENDS_ONLY posts from friends
                // Friendship has userId and friendId columns
                Subquery<UUID> friendQuery = query.subquery(UUID.class);
                Root<Friendship> friendship = friendQuery.from(Friendship.class);
                
                // Get friend IDs where current user is either userId or friendId
                Predicate userIsFriend1 = cb.and(
                    cb.equal(friendship.get("userId"), userId),
                    cb.equal(friendship.get("status"), FriendshipStatus.ACCEPTED)
                );
                Predicate userIsFriend2 = cb.and(
                    cb.equal(friendship.get("friendId"), userId),
                    cb.equal(friendship.get("status"), FriendshipStatus.ACCEPTED)
                );
                
                // Select the "other" user ID (the friend)
                friendQuery.select(
                    cb.<UUID>selectCase()
                        .when(cb.equal(friendship.get("userId"), userId), friendship.get("friendId"))
                        .otherwise(friendship.get("userId"))
                ).where(cb.or(userIsFriend1, userIsFriend2));
                
                Predicate friendsPosts = cb.and(
                    cb.equal(root.get("privacy"), com.mapic.entity.PostPrivacy.FRIENDS_ONLY),
                    root.get("user").get("id").in(friendQuery)
                );
                
                predicates.add(cb.or(publicPosts, ownPosts, friendsPosts));
            } else {
                // User not logged in: only PUBLIC posts
                predicates.add(cb.equal(root.get("privacy"), com.mapic.entity.PostPrivacy.PUBLIC));
            }
            
            for (FilterConfigDTO filter : filters) {
                try {
                    Predicate predicate = buildPredicate(root, query, cb, filter, userId, userLat, userLng);
                    if (predicate != null) {
                        predicates.add(predicate);
                    }
                } catch (Exception e) {
                    log.error("Error building predicate for filter: {}", filter, e);
                }
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Predicate buildPredicate(
        Root<Post> root,
        CriteriaQuery<?> query,
        CriteriaBuilder cb,
        FilterConfigDTO filter,
        UUID userId,
        Double userLat,
        Double userLng
    ) {
        return switch (filter.getType()) {
            case SOCIAL -> buildSocialPredicate(root, query, cb, filter, userId);
            case LOCATION -> buildLocationPredicate(root, cb, filter, userLat, userLng);
            case TIME -> buildTimePredicate(root, cb, filter);
            case CONTENT -> buildContentPredicate(root, query, cb, filter);
            case ENGAGEMENT -> buildEngagementPredicate(root, cb, filter);
            case RECOMMENDATION -> buildRecommendationPredicate(root, cb, filter, userId);
            default -> null;
        };
    }

    private Predicate buildSocialPredicate(
        Root<Post> root,
        CriteriaQuery<?> query,
        CriteriaBuilder cb,
        FilterConfigDTO filter,
        UUID userId
    ) {
        if (userId == null) {
            return null;
        }

        return switch (filter.getValue().toLowerCase()) {
            case "friends" -> {
                // Subquery to get friend IDs
                // Friendship table has userId and friendId, need to check both directions
                Subquery<UUID> friendQuery = query.subquery(UUID.class);
                Root<Friendship> friendship = friendQuery.from(Friendship.class);
                
                // Get friends where current user is userId
                Predicate isUserId = cb.and(
                    cb.equal(friendship.get("userId"), userId),
                    cb.equal(friendship.get("status"), FriendshipStatus.ACCEPTED)
                );
                
                // Get friends where current user is friendId
                Predicate isFriendId = cb.and(
                    cb.equal(friendship.get("friendId"), userId),
                    cb.equal(friendship.get("status"), FriendshipStatus.ACCEPTED)
                );
                
                // Select the other user's ID
                friendQuery.select(
                    cb.<UUID>selectCase()
                        .when(cb.equal(friendship.get("userId"), userId), friendship.get("friendId"))
                        .otherwise(friendship.get("userId"))
                ).where(cb.or(isUserId, isFriendId));
                
                yield root.get("user").get("id").in(friendQuery);
            }
            case "friends_of_friends" -> {
                // Subquery to get friend IDs of friends
                Subquery<UUID> fofQuery = query.subquery(UUID.class);
                Root<Friendship> friendship1 = fofQuery.from(Friendship.class);
                
                // First: get current user's friends
                Subquery<UUID> myFriends = query.subquery(UUID.class);
                Root<Friendship> f1 = myFriends.from(Friendship.class);
                myFriends.select(
                    cb.<UUID>selectCase()
                        .when(cb.equal(f1.get("userId"), userId), f1.get("friendId"))
                        .otherwise(f1.get("userId"))
                ).where(cb.and(
                    cb.or(cb.equal(f1.get("userId"), userId), cb.equal(f1.get("friendId"), userId)),
                    cb.equal(f1.get("status"), FriendshipStatus.ACCEPTED)
                ));

                // Second: get friends of those friends
                fofQuery.select(
                    cb.<UUID>selectCase()
                        .when(friendship1.get("userId").in(myFriends), friendship1.get("friendId"))
                        .otherwise(friendship1.get("userId"))
                ).where(cb.and(
                    cb.or(friendship1.get("userId").in(myFriends), friendship1.get("friendId").in(myFriends)),
                    cb.equal(friendship1.get("status"), FriendshipStatus.ACCEPTED),
                    cb.notEqual(friendship1.get("userId"), userId), // Not me
                    cb.notEqual(friendship1.get("friendId"), userId) // Not me
                ));
                
                yield root.get("user").get("id").in(fofQuery);
            }
            default -> null;
        };
    }

    private Predicate buildLocationPredicate(
        Root<Post> root,
        CriteriaBuilder cb,
        FilterConfigDTO filter,
        Double userLat,
        Double userLng
    ) {
        if (userLat == null || userLng == null) {
            return null;
        }

        return switch (filter.getValue().toLowerCase()) {
            case "nearby" -> {
                Double radius = filter.getParams().get("radius") != null 
                    ? ((Number) filter.getParams().get("radius")).doubleValue() 
                    : 5.0;
                
                // Use a simple bounding-box approximation (no PostgreSQL extension required).
                // 1 degree latitude ≈ 111.32 km; 1 degree longitude ≈ 111.32 * cos(lat) km.
                // This is slightly imprecise at extreme latitudes but fine for mobile app radii.
                double latDelta = radius / 111.32;
                double lngDelta = radius / (111.32 * Math.cos(Math.toRadians(userLat)));
                
                Predicate latRange = cb.between(
                    root.get("latitude"),
                    cb.literal(userLat - latDelta),
                    cb.literal(userLat + latDelta)
                );
                Predicate lngRange = cb.between(
                    root.get("longitude"),
                    cb.literal(userLng - lngDelta),
                    cb.literal(userLng + lngDelta)
                );
                
                yield cb.and(latRange, lngRange);
            }
            default -> null;
        };
    }

    private Predicate buildTimePredicate(
        Root<Post> root,
        CriteriaBuilder cb,
        FilterConfigDTO filter
    ) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        
        return switch (filter.getValue().toLowerCase()) {
            case "today" -> cb.greaterThanOrEqualTo(
                root.get("createdAt"), 
                todayStart
            );
            case "this_week" -> cb.greaterThanOrEqualTo(
                root.get("createdAt"), 
                now.minusDays(7)
            );
            case "this_month" -> cb.greaterThanOrEqualTo(
                root.get("createdAt"), 
                now.minusDays(30)
            );
            case "custom" -> {
                if (filter.getParams().containsKey("startDate") && filter.getParams().containsKey("endDate")) {
                    LocalDateTime start = (LocalDateTime) filter.getParams().get("startDate");
                    LocalDateTime end = (LocalDateTime) filter.getParams().get("endDate");
                    yield cb.between(root.get("createdAt"), start, end);
                }
                yield null;
            }
            default -> null;
        };
    }

    private Predicate buildContentPredicate(
        Root<Post> root,
        CriteriaQuery<?> query,
        CriteriaBuilder cb,
        FilterConfigDTO filter
    ) {
        return switch (filter.getValue().toLowerCase()) {
            case "photos_only" -> {
                // Posts that have at least one image
                Subquery<Long> imageQuery = query.subquery(Long.class);
                Root<PostImage> imageRoot = imageQuery.from(PostImage.class);
                imageQuery.select(imageRoot.get("post").get("id"))
                    .where(cb.equal(imageRoot.get("post").get("id"), root.get("id")));
                
                yield cb.exists(imageQuery);
            }
            case "long_posts" -> cb.greaterThan(
                cb.length(root.get("content")), 
                200
            );
            case "check_ins" -> cb.isNotNull(root.get("locationName"));
            default -> null;
        };
    }

    private Predicate buildEngagementPredicate(
        Root<Post> root,
        CriteriaBuilder cb,
        FilterConfigDTO filter
    ) {
        return switch (filter.getValue().toLowerCase()) {
            case "trending", "popular" -> {
                // Posts with high engagement relative to typical data
                Expression<Integer> likeCount = cb.size(root.get("likes"));
                Expression<Integer> commentCount = cb.size(root.get("comments"));
                Expression<Integer> viewCount = root.get("viewCount");
                
                // engagement score = likes + comments + (views / 10)
                Expression<Integer> totalEngagement = cb.sum(cb.sum(likeCount, commentCount), cb.quot(viewCount, 10));
                
                yield cb.greaterThan(totalEngagement, 0); // Show anything with interaction or views for now
            }
            case "most_liked" -> cb.greaterThan(cb.size(root.get("likes")), 0);
            case "most_discussed" -> cb.greaterThan(cb.size(root.get("comments")), 0);
            default -> null;
        };
    }

    private Predicate buildRecommendationPredicate(
        Root<Post> root,
        CriteriaBuilder cb,
        FilterConfigDTO filter,
        UUID userId
    ) {
        return switch (filter.getValue().toLowerCase()) {
            case "for_you" -> {
                // For now, prioritize popular posts or recent ones
                Expression<Integer> likeCount = cb.size(root.get("likes"));
                Expression<Integer> commentCount = cb.size(root.get("comments"));
                Expression<Integer> viewCount = root.get("viewCount");
                Expression<Integer> engagement = cb.sum(cb.sum(likeCount, commentCount), cb.quot(viewCount, 10));
                
                yield cb.or(
                    cb.greaterThan(engagement, 0),
                    cb.greaterThanOrEqualTo(root.get("createdAt"), LocalDateTime.now().minusDays(3))
                );
            }
            case "discovery" -> {
                // Discover new content outside friends if possible, but keep it high engagement
                yield cb.equal(root.get("privacy"), com.mapic.entity.PostPrivacy.PUBLIC);
            }
            default -> null;
        };
    }

    @Override
    public void validateFilters(List<FilterConfigDTO> filters) {
        List<String> conflicts = detectConflicts(filters);
        if (!conflicts.isEmpty()) {
            throw new InvalidFilterException("Filter conflicts detected: " + String.join(", ", conflicts));
        }
    }

    @Override
    public List<String> detectConflicts(List<FilterConfigDTO> filters) {
        List<String> conflicts = new ArrayList<>();
        
        for (int i = 0; i < filters.size(); i++) {
            for (int j = i + 1; j < filters.size(); j++) {
                if (hasConflict(filters.get(i), filters.get(j))) {
                    conflicts.add(String.format(
                        "%s conflicts with %s",
                        filters.get(i).getLabel(),
                        filters.get(j).getLabel()
                    ));
                }
            }
        }
        
        return conflicts;
    }

    @Override
    public boolean hasConflict(FilterConfigDTO filter1, FilterConfigDTO filter2) {
        // Same type filters might conflict
        if (filter1.getType() == filter2.getType()) {
            // Multiple filters of same type are generally allowed
            // except for some specific cases
            if (filter1.getType() == FilterType.SOCIAL) {
                // Can't have both "friends" and "discovery" mode
                return false; // Allow multiple social filters for now
            }
        }
        
        // Discovery mode conflicts with friends filter
        if (filter1.getType() == FilterType.DISCOVERY && filter2.getType() == FilterType.SOCIAL) {
            return true;
        }
        if (filter2.getType() == FilterType.DISCOVERY && filter1.getType() == FilterType.SOCIAL) {
            return true;
        }
        
        return false;
    }
}
