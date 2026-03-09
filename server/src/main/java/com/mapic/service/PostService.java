package com.mapic.service;

import com.mapic.dto.feed.FeedRequestDTO;
import com.mapic.dto.feed.FeedResponseDTO;
import com.mapic.dto.feed.FilterConfigDTO;
import com.mapic.dto.post.CreatePostRequest;
import com.mapic.dto.post.PostDTO;
import com.mapic.dto.post.UpdatePostRequest;
import com.mapic.entity.*;
import com.mapic.repository.PostRepository;
import com.mapic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HashtagService hashtagService;
    private final FriendshipService friendshipService;
    private final FilterService filterService;

    /**
     * Create a new post
     */
    @Transactional
    public PostDTO createPost(CreatePostRequest request, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Create post
        Post post = Post.builder()
            .user(user)
            .content(request.getContent())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .locationName(request.getLocationName())
            .privacy(request.getPrivacy())
            .viewCount(0)
            .images(new ArrayList<>())
            .build();

        // Add images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                PostImage image = PostImage.builder()
                    .post(post)
                    .imageUrl(request.getImageUrls().get(i))
                    .displayOrder(i)
                    .build();
                post.getImages().add(image);
            }
        }

        // Extract and add hashtags
        Set<String> hashtagNames = hashtagService.extractHashtags(request.getContent());
        for (String tagName : hashtagNames) {
            Hashtag hashtag = hashtagService.findOrCreate(tagName);
            post.addHashtag(hashtag);
            hashtagService.incrementUsageCount(hashtag);
        }

        Post saved = postRepository.save(post);
        log.info("User {} created post {} at ({}, {})", userId, saved.getId(),
            saved.getLatitude(), saved.getLongitude());

        return PostDTO.from(saved, userId);
    }

    /**
     * Update a post
     */
    @Transactional
    public PostDTO updatePost(Long postId, UUID userId, UpdatePostRequest request) {
        Post post = postRepository.findByIdWithDetails(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check ownership
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this post");
        }

        // Update fields
        if (request.getContent() != null) {
            // Handle hashtag changes
            Set<String> oldHashtags = hashtagService.extractHashtags(post.getContent());
            Set<String> newHashtags = hashtagService.extractHashtags(request.getContent());

            // Remove old hashtags
            for (String tagName : oldHashtags) {
                if (!newHashtags.contains(tagName)) {
                    Hashtag hashtag = hashtagService.findOrCreate(tagName);
                    post.removeHashtag(hashtag);
                    hashtagService.decrementUsageCount(hashtag);
                }
            }

            // Add new hashtags
            for (String tagName : newHashtags) {
                if (!oldHashtags.contains(tagName)) {
                    Hashtag hashtag = hashtagService.findOrCreate(tagName);
                    post.addHashtag(hashtag);
                    hashtagService.incrementUsageCount(hashtag);
                }
            }

            post.setContent(request.getContent());
        }

        if (request.getPrivacy() != null) {
            post.setPrivacy(request.getPrivacy());
        }

        if (request.getLocationName() != null) {
            post.setLocationName(request.getLocationName());
        }

        Post updated = postRepository.save(post);
        log.info("User {} updated post {}", userId, postId);

        return PostDTO.from(updated, userId);
    }

    /**
     * Delete a post
     */
    @Transactional
    public void deletePost(Long postId, UUID userId) {
        Post post = postRepository.findByIdWithDetails(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check ownership
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this post");
        }

        // Decrement hashtag usage counts
        for (Hashtag hashtag : post.getHashtags()) {
            hashtagService.decrementUsageCount(hashtag);
        }

        postRepository.delete(post);
        log.info("User {} deleted post {}", userId, postId);
    }

    /**
     * Get post by ID
     */
    @Transactional
    public PostDTO getPost(Long postId, UUID currentUserId) {
        Post post = postRepository.findByIdWithDetails(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check visibility
        if (!canUserViewPost(post, currentUserId)) {
            throw new RuntimeException("Not authorized to view this post");
        }

        // Increment view count
        post.incrementViewCount();
        postRepository.save(post);

        return PostDTO.from(post, currentUserId);
    }

    /**
     * Get nearby posts
     */
    @Transactional(readOnly = true)
    public List<PostDTO> getNearbyPosts(
        Double latitude,
        Double longitude,
        Double radiusKm,
        UUID currentUserId
    ) {
        Double radiusMeters = radiusKm * 1000;

        List<Post> posts;
        if (currentUserId != null) {
            posts = postRepository.findNearbyPostsForUser(
                latitude, longitude, radiusMeters, currentUserId, 100
            );
        } else {
            posts = postRepository.findNearbyPublicPosts(
                latitude, longitude, radiusMeters, 100
            );
        }

        return posts.stream()
            .map(post -> PostDTO.from(post, currentUserId))
            .collect(Collectors.toList());
    }

    /**
     * Get feed posts (from friends)
     */
    @Transactional(readOnly = true)
    public Page<PostDTO> getFeedPosts(UUID userId, Pageable pageable) {
        Set<UUID> friendIdsSet = friendshipService.getFriendIds(userId);
        List<UUID> friendIds = new ArrayList<>(friendIdsSet);
        friendIds.add(userId); // Include own posts

        Page<Post> posts = postRepository.findFeedPosts(friendIds, pageable);
        return posts.map(post -> PostDTO.from(post, userId));
    }

    /**
     * Get feed posts with filters
     */
    @Transactional(readOnly = true)
    public FeedResponseDTO getFeedWithFilters(FeedRequestDTO request, UUID userId) {
        // Validate filters
        if (request.getFilters() != null && !request.getFilters().isEmpty()) {
            filterService.validateFilters(request.getFilters());
        }

        // Build specification from filters
        Specification<Post> spec = filterService.buildSpecification(
            request.getFilters(),
            userId,
            request.getLatitude(),
            request.getLongitude()
        );

        // Create pageable with sorting
        Sort sort = getSortFromRequest(request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        // Execute query
        Page<Post> posts = postRepository.findAll(spec, pageable);

        // Convert to DTOs
        List<PostDTO> postDTOs = posts.getContent().stream()
            .map(post -> PostDTO.from(post, userId))
            .collect(Collectors.toList());

        // Build response
        return FeedResponseDTO.builder()
            .content(postDTOs)
            .totalElements(posts.getTotalElements())
            .totalPages(posts.getTotalPages())
            .currentPage(posts.getNumber())
            .pageSize(posts.getSize())
            .last(posts.isLast())
            .appliedFilters(request.getFilters())
            .suggestions(new ArrayList<>()) // TODO: Implement suggestions
            .build();
    }

    private Sort getSortFromRequest(String sortBy) {
        // Note: sorting by likes.size/comments.size is NOT supported in JPA Specifications
        // because you cannot sort by collection sizes directly in JPQL with Pageable.
        // All sort modes use createdAt DESC for now; engagement-based sorting would require
        // a denormalized like_count/comment_count column or a native query.
        return Sort.by(Sort.Order.desc("createdAt"));
    }

    /**
     * Get posts by user
     */
    @Transactional(readOnly = true)
    public Page<PostDTO> getUserPosts(UUID userId, UUID currentUserId, Pageable pageable) {
        Page<Post> posts = postRepository.findByUserId(userId, pageable);

        // Filter by visibility
        return posts
            .map(post -> canUserViewPost(post, currentUserId) ? PostDTO.from(post, currentUserId) : null)
            .map(dto -> dto); // Remove nulls handled by stream
    }

    /**
     * Get posts by hashtag
     */
    @Transactional(readOnly = true)
    public Page<PostDTO> getPostsByHashtag(String hashtagName, UUID currentUserId, Pageable pageable) {
        Page<Post> posts = postRepository.findByHashtag(hashtagName.toLowerCase(), pageable);
        return posts.map(post -> PostDTO.from(post, currentUserId));
    }

    /**
     * Get user's post count
     */
    @Transactional(readOnly = true)
    public Long getUserPostCount(UUID userId) {
        return postRepository.countByUserId(userId);
    }

    /**
     * Check if user can view a post based on privacy settings
     */
    private boolean canUserViewPost(Post post, UUID currentUserId) {
        if (post.getPrivacy() == PostPrivacy.PUBLIC) {
            return true;
        }

        if (currentUserId == null) {
            return false;
        }

        // Owner can always view
        if (post.getUser().getId().equals(currentUserId)) {
            return true;
        }

        if (post.getPrivacy() == PostPrivacy.PRIVATE) {
            return false;
        }

        // FRIENDS_ONLY: check friendship
        if (post.getPrivacy() == PostPrivacy.FRIENDS_ONLY) {
            return friendshipService.areFriends(post.getUser().getId(), currentUserId);
        }

        return false;
    }
}
