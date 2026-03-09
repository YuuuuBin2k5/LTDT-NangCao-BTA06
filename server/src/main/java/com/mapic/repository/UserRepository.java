package com.mapic.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mapic.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByPhone(String phone);
    
    /**
     * Search for users with PUBLIC profile visibility by keyword.
     * Searches in both nickName and username fields (case-insensitive).
     * Uses parameterized queries to prevent SQL injection.
     * 
     * @param keyword the search keyword
     * @return list of users matching the keyword with PUBLIC visibility
     */
    @Query("SELECT u FROM User u WHERE " +
           "u.profileVisibility = 'PUBLIC' AND " +
           "(LOWER(u.nickName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchPublicUsers(@Param("keyword") String keyword);
}