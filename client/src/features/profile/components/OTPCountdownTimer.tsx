import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface OTPCountdownTimerProps {
  onResend: () => Promise<void>;
  initialSeconds?: number;
}

export function OTPCountdownTimer({
  onResend,
  initialSeconds = 180, // 3 minutes default
}: OTPCountdownTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start countdown
    if (secondsRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [secondsRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      // Reset timer after successful resend
      setSecondsRemaining(initialSeconds);
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsResending(false);
    }
  };

  const isExpired = secondsRemaining === 0;

  return (
    <View style={styles.container}>
      {!isExpired ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Mã OTP hết hạn sau:</Text>
          <Text style={styles.timerText}>{formatTime(secondsRemaining)}</Text>
        </View>
      ) : (
        <View style={styles.expiredContainer}>
          <Text style={styles.expiredText}>Mã OTP đã hết hạn</Text>
          <TouchableOpacity
            style={[styles.resendButton, isResending && styles.resendButtonDisabled]}
            onPress={handleResend}
            disabled={isResending}
          >
            <Text style={styles.resendButtonText}>
              {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
    fontVariant: ['tabular-nums'],
  },
  expiredContainer: {
    alignItems: 'center',
  },
  expiredText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 15,
    fontWeight: '600',
  },
  resendButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
