package com.mapic.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mapic.entity.UserAvatarFrame;
import com.mapic.entity.UserAvatarFrame.UserAvatarFrameId;

@Repository
public interface UserAvatarFrameRepository extends JpaRepository<UserAvatarFrame, UserAvatarFrameId> {
    
    @Query("SELECT uaf FROM UserAvatarFrame uaf WHERE uaf.user.id = :userId")
    List<UserAvatarFrame> findByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT uaf FROM UserAvatarFrame uaf WHERE uaf.user.id = :userId AND uaf.isSelected = true")
    Optional<UserAvatarFrame> findSelectedByUserId(@Param("userId") UUID userId);
    
    @Modifying
    @Query("UPDATE UserAvatarFrame uaf SET uaf.isSelected = false WHERE uaf.user.id = :userId")
    void deselectAllForUser(@Param("userId") UUID userId);
    
    @Query("SELECT CASE WHEN COUNT(uaf) > 0 THEN true ELSE false END FROM UserAvatarFrame uaf " +
           "WHERE uaf.user.id = :userId AND uaf.frame.id = :frameId")
    boolean existsByUserIdAndFrameId(@Param("userId") UUID userId, @Param("frameId") String frameId);
}
