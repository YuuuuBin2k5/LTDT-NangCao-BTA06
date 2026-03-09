import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  validate?: (value: string) => string | undefined;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  validate,
  onChangeText,
  onBlur,
  ...textInputProps
}) => {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [isFocused, setIsFocused] = useState(false);

  const displayError = error || internalError;

  const handleChangeText = (text: string) => {
    if (validate && internalError) {
      setInternalError(undefined);
    }
    onChangeText?.(text);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (validate && textInputProps.value) {
      const validationError = validate(textInputProps.value);
      setInternalError(validationError);
    }
    onBlur?.(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.input_focused,
          displayError && styles.input_error,
          inputStyle,
        ]}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor="#999"
        {...textInputProps}
      />
      {displayError && (
        <Text style={[styles.errorText, errorStyle]}>{displayError}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  input_focused: {
    borderColor: '#2ecc71',
    borderWidth: 2,
  },
  input_error: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
});
