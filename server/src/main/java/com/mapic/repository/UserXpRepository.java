package com.mapic.repository;

import com.mapic.entity.UserXp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserXpRepository extends JpaRepository<UserXp, UUID> {
}
