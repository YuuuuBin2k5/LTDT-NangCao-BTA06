package com.mapic.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local file system implementation of ImageStorageService
 * For development and testing purposes
 */
@Service
@Slf4j
public class LocalImageStorageService implements ImageStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8080/uploads}")
    private String baseUrl;

    private static final int THUMBNAIL_SIZE = 400;
    private static final int MARKER_THUMBNAIL_SIZE = 100;
    private static final double COMPRESSION_QUALITY = 0.8;

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        validateImage(file);

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("Uploaded image: {}", filename);
        return baseUrl + "/" + filename;
    }

    @Override
    public ImageUploadResult uploadImageWithThumbnail(MultipartFile file) throws IOException {
        validateImage(file);

        // Create directories
        Path uploadPath = Paths.get(uploadDir);
        Path thumbnailPath = uploadPath.resolve("thumbnails");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        if (!Files.exists(thumbnailPath)) {
            Files.createDirectories(thumbnailPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String baseFilename = UUID.randomUUID().toString();
        String filename = baseFilename + extension;
        String thumbnailFilename = baseFilename + "_thumb" + extension;

        // Save original image (compressed)
        Path originalPath = uploadPath.resolve(filename);
        Thumbnails.of(file.getInputStream())
            .scale(1.0)
            .outputQuality(COMPRESSION_QUALITY)
            .toFile(originalPath.toFile());

        // Generate thumbnail
        Path thumbPath = thumbnailPath.resolve(thumbnailFilename);
        Thumbnails.of(originalPath.toFile())
            .size(THUMBNAIL_SIZE, THUMBNAIL_SIZE)
            .outputQuality(COMPRESSION_QUALITY)
            .toFile(thumbPath.toFile());

        String imageUrl = baseUrl + "/" + filename;
        String thumbnailUrl = baseUrl + "/thumbnails/" + thumbnailFilename;

        log.info("Uploaded image with thumbnail: {} -> {}", filename, thumbnailFilename);
        return new ImageUploadResult(imageUrl, thumbnailUrl);
    }

    @Override
    public void deleteImage(String imageUrl) throws IOException {
        if (imageUrl == null || !imageUrl.startsWith(baseUrl)) {
            log.warn("Invalid image URL for deletion: {}", imageUrl);
            return;
        }

        // Extract filename from URL
        String filename = imageUrl.substring(baseUrl.length() + 1);
        Path filePath = Paths.get(uploadDir, filename);

        if (Files.exists(filePath)) {
            Files.delete(filePath);
            log.info("Deleted image: {}", filename);

            // Also delete thumbnail if exists
            String thumbnailFilename = filename.replace(".", "_thumb.");
            Path thumbnailPath = Paths.get(uploadDir, "thumbnails", thumbnailFilename);
            if (Files.exists(thumbnailPath)) {
                Files.delete(thumbnailPath);
                log.info("Deleted thumbnail: {}", thumbnailFilename);
            }
        }
    }

    /**
     * Validate uploaded image
     */
    private void validateImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        // Check file size (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IOException("File size exceeds maximum limit of 10MB");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("File must be an image");
        }

        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null || !isValidImageExtension(filename)) {
            throw new IOException("Invalid image file extension. Only jpg, jpeg, png are allowed");
        }
    }

    /**
     * Check if file has valid image extension
     */
    private boolean isValidImageExtension(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return extension.equals(".jpg") || extension.equals(".jpeg") || extension.equals(".png");
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot) : "";
    }
}
