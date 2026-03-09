/**
 * OptimizedImage - Image component with lazy loading and caching
 */
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { API_BASE_URL } from '../constants/api.constants';

/**
 * Transform image URLs to use the correct server address
 * This handles:
 * 1. Relative URLs (e.g., /uploads/image.jpg) - prepend with server base
 * 2. localhost URLs that need to be replaced with actual server IP
 * 3. Old/stale server IPs that need to be updated to current server IP
 * 
 * IMPORTANT: Does NOT transform external URLs (like DiceBear API, CDNs, etc.)
 */
const transformImageUrl = (uri: string): string => {
  // Extract the current server base from API_BASE_URL
  // API_BASE_URL format: http://192.168.1.5:8081/api
  const apiBaseWithoutPath = API_BASE_URL.replace('/api', '');
  
  // Handle relative URLs (starts with /)
  if (uri.startsWith('/')) {
    return apiBaseWithoutPath + uri;
  }
  
  // If the URI already starts with the correct API base, return as-is
  if (uri.startsWith(apiBaseWithoutPath)) {
    return uri;
  }
  
  // Handle localhost URLs - these are internal server URLs
  if (uri.includes('localhost:8080') || uri.includes('localhost:8081')) {
    return uri.replace(/localhost:808[01]/, apiBaseWithoutPath.replace('http://', '').replace('https://', ''));
  }
  
  // Check if this is an external URL (not from our server)
  // External URLs include: api.dicebear.com, CDNs, other domains
  const isExternalUrl = uri.match(/^https?:\/\/(?!192\.168\.|10\.|172\.|localhost)/);
  if (isExternalUrl) {
    // Don't transform external URLs - return as-is
    return uri;
  }
  
  // Handle internal server IP/port combinations - replace with current server
  // This only handles local network IPs (192.168.x.x, 10.x.x.x, 172.x.x.x)
  const isLocalNetworkUrl = uri.match(/^https?:\/\/(192\.168\.|10\.|172\.)/);
  if (isLocalNetworkUrl) {
    const urlPattern = /^https?:\/\/[^\/]+/;
    const match = uri.match(urlPattern);
    if (match) {
      // Replace the protocol://host:port part with the current API base
      return uri.replace(match[0], apiBaseWithoutPath);
    }
  }
  
  // Handle stale local file cache paths that no longer exist
  if (uri.startsWith('file:///') && uri.includes('/cache/ImagePicker/')) {
    // These are temporary Expo ImagePicker files that get deleted between app reloads.
    return ''; // Return empty string to force fallback
  }
  
  return uri;
};

interface OptimizedImageProps {
  uri: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: 'low' | 'normal' | 'high';
  transition?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  containerStyle,
  placeholder,
  contentFit = 'cover',
  priority = 'normal',
  transition = 300,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Transform the URI to replace localhost with actual IP
  const transformedUri = transformImageUrl(uri);
  
  // Debug log
  if (uri !== transformedUri) {
    console.log('Image URL transformed:', { original: uri, transformed: transformedUri });
  }

  React.useEffect(() => {
    if (!transformedUri) {
      setIsLoading(false);
      setHasError(true);
    }
  }, [transformedUri]);

  return (
    <View style={[styles.container, containerStyle]}>
      {transformedUri ? (
        <Image
          source={{ uri: transformedUri }}
          style={[styles.image, style]}
          contentFit={contentFit}
          placeholder={placeholder}
          transition={transition}
          priority={priority}
          cachePolicy="memory-disk"
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
            console.warn('OptimizedImage: Failed to load transformed URI:', transformedUri);
          }}
        />
      ) : null}
      
      {isLoading && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
      
      {hasError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#bdbdbd',
  },
});
