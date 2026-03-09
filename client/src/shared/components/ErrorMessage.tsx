import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface ErrorMessageProps {
  message: string;
  visible?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
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
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
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
    color: '#c0392b',
    fontSize: 14,
    flex: 1,
  },
});
