package com.mapic.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Interface for image storage operations
 * Implementations can use local storage, AWS S3, Cloudinary, etc.
 */
public interface ImageStorageService {

    /**
     * Upload an image and return the URL
     * @param file The image file to upload
     * @return The URL of the uploaded image
     * @throws IOException if upload fails
     */
    String uploadImage(MultipartFile file) throws IOException;

    /**
     * Upload an image and generate thumbnail
     * @param file The image file to upload
     * @return ImageUploadResult containing both image and thumbnail URLs
     * @throws IOException if upload fails
     */
    ImageUploadResult uploadImageWithThumbnail(MultipartFile file) throws IOException;

    /**
     * Delete an image by URL
     * @param imageUrl The URL of the image to delete
     * @throws IOException if deletion fails
     */
    void deleteImage(String imageUrl) throws IOException;

    /**
     * Result of image upload with thumbnail
     */
    record ImageUploadResult(String imageUrl, String thumbnailUrl) {}
}
