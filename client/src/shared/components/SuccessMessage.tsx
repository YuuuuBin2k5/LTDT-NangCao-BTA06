import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface SuccessMessageProps {
  message: string;
  visible?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  visible = true,
  style,
  textStyle,
  icon,
}) => {
  if (!visible || !message) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    color: '#155724',
    fontSize: 14,
    flex: 1,
  },
});
