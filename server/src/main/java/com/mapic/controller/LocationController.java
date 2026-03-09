package com.mapic.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mapic.dto.LocationRequest;
import com.mapic.dto.location.FriendLocationDTO;
import com.mapic.dto.location.LocationHistoryDTO;
import com.mapic.entity.User;
import com.mapic.service.LocationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/update")
    public ResponseEntity<?> updateLocation(
            @AuthenticationPrincipal User user,
            @RequestBody LocationRequest request) {
        
        System.out.println("📍 Location update request from user: " + (user != null ? user.getUsername() : "null"));
        System.out.println("   Latitude: " + request.getLatitude() + ", Longitude: " + request.getLongitude());
        
        try {
            locationService.updateLocation(user, request);
            System.out.println("✅ Location updated successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("❌ Failed to update location: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to update location: " + e.getMessage());
        }
    }

    @GetMapping("/friends")
    public ResponseEntity<List<FriendLocationDTO>> getFriendLocations(
            @AuthenticationPrincipal User user) {
        
        System.out.println("📍 Get friend locations request from user: " + user.getUsername());
        
        try {
            List<FriendLocationDTO> friendLocations = locationService.getFriendLocations(user.getId());
            System.out.println("✅ Retrieved " + friendLocations.size() + " friend locations");
            return ResponseEntity.ok(friendLocations);
        } catch (Exception e) {
            System.out.println("❌ Failed to get friend locations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<LocationHistoryDTO>> getLocationHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "7") int days) {
        
        System.out.println("📍 Get location history request from user: " + user.getUsername() + " for " + days + " days");
        
        try {
            List<LocationHistoryDTO> history = locationService.getLocationHistory(user.getId(), days);
            System.out.println("✅ Retrieved " + history.size() + " location history entries");
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.out.println("❌ Failed to get location history: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearLocationHistory(@AuthenticationPrincipal User user) {
        
        System.out.println("📍 Clear location history request from user: " + user.getUsername());
        
        try {
            locationService.clearLocationHistory(user.getId());
            System.out.println("✅ Location history cleared successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("❌ Failed to clear location history: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}