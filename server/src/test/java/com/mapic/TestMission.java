package com.mapic;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.mapic.service.MissionService;
import com.mapic.repository.UserRepository;
import com.mapic.entity.User;
import com.mapic.entity.Mission;
import com.mapic.repository.MissionRepository;
import java.util.UUID;
import java.util.Optional;

@SpringBootTest
public class TestMission {

    @Autowired
    private MissionService missionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Test
    public void testStartJourney() {
        try {
            System.out.println("Finding testuser...");
            Optional<User> userOpt = userRepository.findByUsername("testuser");
            if (userOpt.isEmpty()) {
                System.out.println("testuser not found!");
                return;
            }
            User user = userOpt.get();
            UUID userId = user.getId();
            System.out.println("User ID: " + userId);

            System.out.println("Let's make sure the user has a cart...");
            missionService.getCart(userId);
            
            System.out.println("Adding a mission to cart...");
            Mission mission = missionRepository.findAll().stream().findFirst().orElseThrow();
            System.out.println("Found mission: " + mission.getId());
            
            try {
                missionService.addToCart(userId, mission.getId());
                System.out.println("Added to cart.");
            } catch (Exception e) {
                System.out.println("Add to cart might have failed (or already added): " + e.getMessage());
            }

            System.out.println("Trying to start journey...");
            missionService.startJourney(userId);
            System.out.println("Journey started SUCCESSFULLY!");

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
