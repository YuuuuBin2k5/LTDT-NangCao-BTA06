package com.mapic.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import com.mapic.service.MissionService;
import com.mapic.repository.UserRepository;
import com.mapic.entity.User;
import com.mapic.entity.Mission;
import com.mapic.repository.MissionRepository;
import java.util.UUID;
import java.util.Optional;

@Component
public class MissionDebugRunner implements CommandLineRunner {

    @Autowired private MissionService missionService;
    @Autowired private UserRepository userRepository;
    @Autowired private MissionRepository missionRepository;

    @Override
    public void run(String... args) throws Exception {
        java.io.File file = new java.io.File("mission_debug.txt");
        try (java.io.PrintWriter pw = new java.io.PrintWriter(file)) {
            pw.println("========== MISSION DEBUG START ==========");
            try {
                Optional<User> userOpt = userRepository.findByUsername("testuser");
                if (userOpt.isEmpty()) {
                    pw.println("testuser not found!");
                    return;
                }
                User user = userOpt.get();
                UUID userId = user.getId();
                
                pw.println("Ensuring cart exists...");
                missionService.getCart(userId);
                
                Mission mission = missionRepository.findAll().stream().findFirst().orElseThrow();
                
                try {
                    pw.println("Adding mission to cart... " + mission.getId());
                    missionService.addToCart(userId, mission.getId());
                } catch (Exception e) {
                    pw.println("Add to cart error (or already added): " + e.getMessage());
                }
                
                try {
                    pw.println("Starting journey...");
                    missionService.startJourney(userId);
                } catch (Exception e) {
                    pw.println("MISSION START FAILED WITH EXCEPTION (might be normal if already started):");
                    e.printStackTrace(pw);
                }
                
                try {
                    pw.println("Testing getTracker()...");
                    com.mapic.dto.mission.MissionCartDTO trackerCart = missionService.getTracker(userId);
                    pw.println("getTracker() SUCCEEDED! XP Possible: " + trackerCart.getTotalXpPossible());
                } catch (Exception e) {
                    pw.println("getTracker() FAILED WITH EXCEPTION:");
                    e.printStackTrace(pw);
                }
            } catch (Exception e) {
                pw.println("OVERALL RUNNER EXCEPTION:");
                e.printStackTrace(pw);
            }
            pw.println("========== MISSION DEBUG END ==========");
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
