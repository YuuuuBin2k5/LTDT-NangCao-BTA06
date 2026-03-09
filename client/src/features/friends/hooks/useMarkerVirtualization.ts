import { useState, useCallback, useMemo } from 'react';
import { Region } from 'react-native-maps';
import { FriendLocation } from '../../../shared/types/location.types';

interface UseMarkerVirtualizationOptions {
  markers: FriendLocation[];
  bufferFactor?: number; // How much extra area to render (default: 1.5)
}

/**
 * Hook for virtualizing map markers
 * Only renders markers within the current viewport plus a buffer
 */
export const useMarkerVirtualization = ({
  markers,
  bufferFactor = 1.5,
}: UseMarkerVirtualizationOptions) => {
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

  /**
   * Check if a marker is within the viewport
   */
  const isMarkerInViewport = useCallback(
    (marker: FriendLocation, region: Region): boolean => {
      const latBuffer = (region.latitudeDelta * bufferFactor) / 2;
      const lonBuffer = (region.longitudeDelta * bufferFactor) / 2;

      const minLat = region.latitude - latBuffer;
      const maxLat = region.latitude + latBuffer;
      const minLon = region.longitude - lonBuffer;
      const maxLon = region.longitude + lonBuffer;

      return (
        marker.latitude >= minLat &&
        marker.latitude <= maxLat &&
        marker.longitude >= minLon &&
        marker.longitude <= maxLon
      );
    },
    [bufferFactor]
  );

  /**
   * Filter markers to only those in viewport
   */
  const visibleMarkers = useMemo(() => {
    if (!currentRegion) {
      return markers;
    }

    return markers.filter((marker) => isMarkerInViewport(marker, currentRegion));
  }, [markers, currentRegion, isMarkerInViewport]);

  /**
   * Handle region change
   */
  const onRegionChangeComplete = useCallback((region: Region) => {
    setCurrentRegion(region);
  }, []);

  return {
    visibleMarkers,
    onRegionChangeComplete,
    totalMarkers: markers.length,
    visibleCount: visibleMarkers.length,
  };
};
