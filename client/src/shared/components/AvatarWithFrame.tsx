import React from 'react';
import { StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';
import { OptimizedImage } from './OptimizedImage';
import { AvatarFrame, FrameType } from '../types/avatar-frame.types';

interface AvatarWithFrameProps {
  uri: string;
  frame?: AvatarFrame;
  size?: number;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  showPadding?: boolean;
}

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  uri,
  frame,
  size = 64,
  containerStyle,
  imageStyle,
  showPadding = true,
}) => {
  // If no frame is selected, display a large avatar
  const avatarSize = showPadding && frame ? size * 0.76 : size;
  
  // Basic rendering logic
  const isSquare = frame?.frameType === FrameType.SQUARE;
  const borderRadius = isSquare ? 12 : size / 2;
  const avatarBorderRadius = isSquare ? 10 : avatarSize / 2;

  // Render multiple rich layers depending on the specific frame ID or premium status
  const renderRichFrame = () => {
    if (!frame) return null;

    const baseRing: ViewStyle = {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: borderRadius,
    };

    const innerRingSize = size * 0.88;
    const innerRing: ViewStyle = {
      position: 'absolute',
      width: innerRingSize,
      height: innerRingSize,
      borderRadius: isSquare ? 10 : innerRingSize / 2,
      top: (size - innerRingSize) / 2,
      left: (size - innerRingSize) / 2,
    };

    // Frame level differentiation based on ID
    if (frame.id === 'frame-1-basic') {
      return (
        <View style={[baseRing, { borderWidth: size * 0.04, borderColor: '#9E9E9E' }]} />
      );
    }
    
    if (frame.id === 'frame-2-bronze') {
      return (
        <>
          <View style={[baseRing, { borderWidth: size * 0.05, borderColor: '#8C5226' }]} />
          <View style={[innerRing, { borderWidth: size * 0.02, borderColor: '#CD7F32' }]} />
        </>
      );
    }

    if (frame.id === 'frame-3-silver') {
      return (
        <>
          <View style={[baseRing, { borderWidth: size * 0.06, borderColor: '#808080' }]} />
          <View style={[innerRing, { borderWidth: size * 0.03, borderColor: '#E0E0E0' }]} />
        </>
      );
    }

    if (frame.id === 'frame-4-gold') {
      return (
        <>
          <View style={[baseRing, { 
            borderWidth: size * 0.07, 
            borderColor: '#DAA520',
            shadowColor: '#DAA520', shadowOpacity: 0.6, shadowRadius: 4, elevation: 4
          }]} />
          <View style={[innerRing, { borderWidth: size * 0.02, borderColor: '#FFD700' }]} />
        </>
      );
    }

    if (frame.id === 'frame-5-diamond') {
      const diamondInner = size * 0.82;
      return (
        <>
          <View style={[baseRing, { 
            borderWidth: size * 0.08, 
            borderColor: '#4A90E2',
            shadowColor: '#4A90E2', shadowOpacity: 0.8, shadowRadius: 6, elevation: 6
          }]} />
          <View style={[innerRing, { borderWidth: size * 0.02, borderColor: '#87CEEB' }]} />
          <View style={{
            position: 'absolute',
            width: diamondInner, height: diamondInner,
            borderRadius: isSquare ? 8 : diamondInner / 2,
            top: (size - diamondInner) / 2, left: (size - diamondInner) / 2,
            borderWidth: size * 0.01, borderColor: '#E0FFFF',
          }} />
        </>
      );
    }

    if (frame.id === 'frame-6-neon') {
      const neonGlow = size * 0.9;
      return (
        <>
          <View style={[baseRing, { borderWidth: size * 0.06, borderColor: '#FF00FF' }]} />
          <View style={{
            position: 'absolute', width: neonGlow, height: neonGlow,
            borderRadius: isSquare ? 10 : neonGlow / 2,
            top: (size - neonGlow) / 2, left: (size - neonGlow) / 2,
            borderWidth: size * 0.04, borderColor: '#00FFFF',
            opacity: 0.8
          }} />
          <View style={[innerRing, { borderWidth: size * 0.02, borderColor: '#FFFFFF' }]} />
        </>
      );
    }

    // Default premium/non-premium fallback
    return (
      <View style={[baseRing, { 
        borderWidth: size * 0.05, 
        borderColor: frame.isPremium ? '#FFD700' : '#4A90E2' 
      }]} />
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }, containerStyle]}>
      {/* Dynamic Frame Layers */}
      <View style={styles.frameOverlay}>
        {renderRichFrame()}
      </View>
      
      {/* Avatar Image */}
      <OptimizedImage
        uri={uri}
        style={[
          styles.avatar,
          { 
            width: avatarSize, 
            height: avatarSize, 
            borderRadius: avatarBorderRadius 
          },
          imageStyle
        ] as ImageStyle}
        containerStyle={{ 
          width: avatarSize, 
          height: avatarSize, 
          borderRadius: avatarBorderRadius,
          overflow: 'hidden',
          zIndex: 2,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#e1e4e8',
  },
  frameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3, // Above avatar to overlay the edges
    pointerEvents: 'none',
  },
});

