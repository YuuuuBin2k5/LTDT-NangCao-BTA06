package com.mapic.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mapic.entity.CurrentLocation;

@Repository
public interface CurrentLocationRepository extends JpaRepository<CurrentLocation, UUID> {
    // Repository này sẽ giúp lưu tọa độ cho User dựa trên UUID của họ
}