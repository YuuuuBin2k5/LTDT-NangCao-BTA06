/**
 * Avatar frame type definitions
 */

/**
 * Frame type enum
 */
export enum FrameType {
  CIRCULAR = 'CIRCULAR',
  SQUARE = 'SQUARE',
  HEART = 'HEART',
  STAR = 'STAR',
  HEXAGON = 'HEXAGON',
  DIAMOND = 'DIAMOND',
  FLOWER = 'FLOWER',
  CLOUD = 'CLOUD',
  BADGE = 'BADGE',
  NEON = 'NEON',
}

/**
 * Avatar frame data
 */
export interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  frameType: FrameType;
  svgPath: string;
  isPremium: boolean;
  unlockCondition?: string;
  unlockRequirementValue?: number;
  isUnlocked: boolean;
  isSelected: boolean;
  displayOrder: number;
  isSeasonal: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
}
