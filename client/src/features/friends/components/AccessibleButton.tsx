import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { triggerHaptic } from '../utils/accessibility.utils';

interface AccessibleButtonProps {
  onPress: () => void;
  label: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  role?: AccessibilityRole;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  label,
  accessibilityLabel,
  accessibilityHint,
  icon,
  style,
  textStyle,
  disabled = false,
  hapticFeedback = 'light',
  role = 'button',
}) => {
  const handlePress = async () => {
    if (disabled) return;

    // Trigger haptic feedback
    await triggerHaptic[hapticFeedback]();

    // Call onPress
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {icon}
      <Text style={[styles.text, disabled && styles.disabledText, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    gap: 8,
    minHeight: 44, // Minimum touch target size
  },
  disabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
});
