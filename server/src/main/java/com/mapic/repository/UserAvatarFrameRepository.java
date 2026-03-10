package com.mapic.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.mapic.entity.UserAvatarFrame;
import com.mapic.entity.UserAvatarFrame.UserAvatarFrameId;

@Repository
public interface UserAvatarFrameRepository extends JpaRepository<UserAvatarFrame, UserAvatarFrameId> {
    
    @Query(value = "SELECT * FROM user_avatar_frames WHERE user_id::text = :userId", nativeQuery = true)
    List<UserAvatarFrame> findFramesByUserId(@Param("userId") String userId);
    
    @Query(value = "SELECT * FROM user_avatar_frames WHERE user_id::text = :userId AND is_selected = true", nativeQuery = true)
    Optional<UserAvatarFrame> findSelectedFrameByUserId(@Param("userId") String userId);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE user_avatar_frames SET is_selected = false WHERE user_id::text = :userId", nativeQuery = true)
    void deselectAllFramesForUser(@Param("userId") String userId);
    
    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM user_avatar_frames " +
           "WHERE user_id::text = :userId AND frame_id::text = :frameId", nativeQuery = true)
    boolean checkFrameUnlocked(@Param("userId") String userId, @Param("frameId") String frameId);
    @Modifying
    @Transactional
    @Query(value = "UPDATE user_avatar_frames SET is_selected = true WHERE user_id::text = :userId AND frame_id::text = :frameId", nativeQuery = true)
    void selectFrameCustom(@Param("userId") String userId, @Param("frameId") String frameId);
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO user_avatar_frames (user_id, frame_id, unlocked_at, is_selected) " +
           "VALUES (CAST(:userId AS uuid), :frameId, CURRENT_TIMESTAMP, false)", nativeQuery = true)
    void unlockFrameCustom(@Param("userId") String userId, @Param("frameId") String frameId);
}
