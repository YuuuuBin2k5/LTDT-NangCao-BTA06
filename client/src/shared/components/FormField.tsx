import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Input, InputProps } from './Input';

export interface FormFieldProps extends InputProps {
  name: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  required = false,
  label,
  containerStyle,
  ...inputProps
}) => {
  const displayLabel = required && label ? `${label} *` : label;

  return (
    <View style={[styles.container, containerStyle]}>
      <Input
        label={displayLabel}
        {...inputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
