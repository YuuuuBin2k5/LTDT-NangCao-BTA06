package com.mapic.repository;

import com.mapic.entity.MissionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionCategoryRepository extends JpaRepository<MissionCategory, Long> {
    List<MissionCategory> findAll();
}
