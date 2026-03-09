package com.mapic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.mapic.entity.AvatarFrame;

@Repository
public interface AvatarFrameRepository extends JpaRepository<AvatarFrame, String> {
    
    @Query("SELECT af FROM AvatarFrame af ORDER BY af.displayOrder ASC")
    List<AvatarFrame> findAllOrderedByDisplayOrder();
    
    @Query("SELECT af FROM AvatarFrame af WHERE af.isPremium = false ORDER BY af.displayOrder ASC")
    List<AvatarFrame> findFreeFrames();
}
