package com.mapic.repository;

import com.mapic.entity.FilterPreset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FilterPresetRepository extends JpaRepository<FilterPreset, Long> {
    
    List<FilterPreset> findByUserIdOrderByUsageCountDesc(UUID userId);
    
    Optional<FilterPreset> findByShareToken(String shareToken);
    
    Optional<FilterPreset> findByUserIdAndIsDefaultTrue(UUID userId);
    
    Optional<FilterPreset> findByIdAndUserId(Long id, UUID userId);
    
    boolean existsByUserIdAndName(UUID userId, String name);
}
