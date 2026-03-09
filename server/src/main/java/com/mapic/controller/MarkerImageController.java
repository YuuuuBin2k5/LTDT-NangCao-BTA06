package com.mapic.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;

/**
 * Controller for generating marker images with circular avatars and colored borders
 */
@RestController
@RequestMapping("/api/markers")
public class MarkerImageController {

    /**
     * Generate a circular marker image with colored border
     * 
     * @param avatarUrl URL of the user's avatar image
     * @param borderColor Hex color code for the border (e.g., "4CAF50")
     * @param size Size of the marker in pixels (default: 60)
     * @return PNG image with circular avatar and border
     */
    @GetMapping("/avatar")
    public ResponseEntity<Resource> generateAvatarMarker(
            @RequestParam String avatarUrl,
            @RequestParam(defaultValue = "4CAF50") String borderColor,
            @RequestParam(defaultValue = "60") int size) {
        
        try {
            // Download the avatar image
            BufferedImage avatar = ImageIO.read(new URL(avatarUrl));
            
            // Create the marker image
            BufferedImage marker = createCircularMarker(avatar, borderColor, size);
            
            // Convert to byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(marker, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();
            
            // Return as PNG image
            ByteArrayResource resource = new ByteArrayResource(imageBytes);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400") // Cache for 24 hours
                    .contentLength(imageBytes.length)
                    .body(resource);
                    
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Create a circular marker image with border
     */
    private BufferedImage createCircularMarker(BufferedImage avatar, String borderColorHex, int size) {
        // Create output image with transparency
        BufferedImage output = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = output.createGraphics();
        
        // Enable anti-aliasing for smooth edges
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        
        // Parse border color
        Color borderColor = Color.decode("#" + borderColorHex);
        
        // Draw border circle (outer circle)
        int borderWidth = 4;
        g2d.setColor(borderColor);
        g2d.fillOval(0, 0, size, size);
        
        // Draw white inner circle (creates border effect)
        g2d.setColor(Color.WHITE);
        g2d.fillOval(borderWidth, borderWidth, size - borderWidth * 2, size - borderWidth * 2);
        
        // Create circular clip for avatar
        int avatarSize = size - borderWidth * 2;
        Ellipse2D.Double clip = new Ellipse2D.Double(borderWidth, borderWidth, avatarSize, avatarSize);
        g2d.setClip(clip);
        
        // Draw avatar scaled to fit
        g2d.drawImage(avatar, borderWidth, borderWidth, avatarSize, avatarSize, null);
        
        g2d.dispose();
        return output;
    }
}
