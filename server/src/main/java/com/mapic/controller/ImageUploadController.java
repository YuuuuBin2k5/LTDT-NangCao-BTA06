package com.mapic.controller;

import com.mapic.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts/images")
@RequiredArgsConstructor
@Slf4j
public class ImageUploadController {

    private final ImageStorageService imageStorageService;

    /**
     * Upload a single image
     * POST /api/posts/images/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            log.info("User {} uploading image: {}", userDetails.getUsername(), file.getOriginalFilename());

            ImageStorageService.ImageUploadResult result = imageStorageService.uploadImageWithThumbnail(file);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", result.imageUrl());
            response.put("thumbnailUrl", result.thumbnailUrl());
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IOException e) {
            log.error("Failed to upload image", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Upload multiple images (max 5)
     * POST /api/posts/images/upload-multiple
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<?> uploadMultipleImages(
        @RequestParam("files") List<MultipartFile> files,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // Validate number of files
            if (files.size() > 5) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Maximum 5 images allowed per upload");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            log.info("User {} uploading {} images", userDetails.getUsername(), files.size());

            List<Map<String, String>> results = new ArrayList<>();

            for (MultipartFile file : files) {
                ImageStorageService.ImageUploadResult result = imageStorageService.uploadImageWithThumbnail(file);

                Map<String, String> imageResult = new HashMap<>();
                imageResult.put("imageUrl", result.imageUrl());
                imageResult.put("thumbnailUrl", result.thumbnailUrl());
                results.add(imageResult);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("images", results);
            response.put("count", results.size());
            response.put("message", "Images uploaded successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IOException e) {
            log.error("Failed to upload images", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete an image
     * DELETE /api/posts/images
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteImage(
        @RequestParam("url") String imageUrl,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            log.info("User {} deleting image: {}", userDetails.getUsername(), imageUrl);

            imageStorageService.deleteImage(imageUrl);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Image deleted successfully");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to delete image", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
