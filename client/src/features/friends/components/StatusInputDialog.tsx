import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

interface StatusInputDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (status: string, emoji?: string) => void;
  currentStatus?: string;
  currentEmoji?: string;
}

const EMOJI_QUICK_PICKS = [
  { emoji: '🏠', label: 'Ở nhà' },
  { emoji: '🏢', label: 'Đi làm' },
  { emoji: '🍕', label: 'Đi ăn' },
  { emoji: '☕', label: 'Cafe' },
  { emoji: '🎮', label: 'Chơi game' },
  { emoji: '🎬', label: 'Xem phim' },
  { emoji: '🏋️', label: 'Tập gym' },
  { emoji: '🛒', label: 'Mua sắm' },
  { emoji: '✈️', label: 'Du lịch' },
  { emoji: '📚', label: 'Học tập' },
  { emoji: '😴', label: 'Nghỉ ngơi' },
  { emoji: '🎉', label: 'Tiệc tùng' },
];

const MAX_STATUS_LENGTH = 50;

/**
 * StatusInputDialog - Dialog for setting status message
 * Requirements: 14.1, 14.2, 14.4
 */
export const StatusInputDialog: React.FC<StatusInputDialogProps> = ({
  visible,
  onClose,
  onSave,
  currentStatus = '',
  currentEmoji = '',
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji);

  const handleEmojiSelect = (emoji: string, label: string) => {
    setSelectedEmoji(emoji);
    if (!status) {
      setStatus(label);
    }
  };

  const handleSave = () => {
    if (status.trim()) {
      onSave(status.trim(), selectedEmoji);
    }
    onClose();
  };

  const handleClear = () => {
    setStatus('');
    setSelectedEmoji('');
    onSave('', '');
    onClose();
  };

  const remainingChars = MAX_STATUS_LENGTH - status.length;
  const isOverLimit = remainingChars < 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Đặt trạng thái</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.headerButton}
              disabled={isOverLimit || !status.trim()}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  styles.saveButton,
                  (isOverLimit || !status.trim()) && styles.disabledButton,
                ]}
              >
                Lưu
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Input */}
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                {selectedEmoji ? (
                  <TouchableOpacity
                    onPress={() => setSelectedEmoji('')}
                    style={styles.emojiButton}
                  >
                    <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
                  </TouchableOpacity>
                ) : null}
                <TextInput
                  style={[styles.input, selectedEmoji && styles.inputWithEmoji]}
                  placeholder="Bạn đang làm gì?"
                  placeholderTextColor="#999"
                  value={status}
                  onChangeText={setStatus}
                  maxLength={MAX_STATUS_LENGTH + 10} // Allow typing over limit to show error
                  multiline
                  autoFocus
                />
              </View>
              
              {/* Character Counter */}
              <View style={styles.counterContainer}>
                <Text
                  style={[
                    styles.counterText,
                    isOverLimit && styles.counterTextError,
                  ]}
                >
                  {remainingChars} / {MAX_STATUS_LENGTH}
                </Text>
              </View>
            </View>

            {/* Emoji Quick Picks */}
            <View style={styles.emojiSection}>
              <Text style={styles.sectionTitle}>Chọn nhanh</Text>
              <View style={styles.emojiGrid}>
                {EMOJI_QUICK_PICKS.map((item) => (
                  <TouchableOpacity
                    key={item.emoji}
                    style={[
                      styles.emojiCard,
                      selectedEmoji === item.emoji && styles.emojiCardSelected,
                    ]}
                    onPress={() => handleEmojiSelect(item.emoji, item.label)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emojiIcon}>{item.emoji}</Text>
                    <Text style={styles.emojiLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Clear Button */}
            {(currentStatus || currentEmoji) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>Xóa trạng thái</Text>
              </TouchableOpacity>
            )}

            {/* Info */}
            <View style={styles.infoSection}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Trạng thái sẽ tự động ẩn sau 4 giờ
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    color: '#2196F3',
    fontWeight: '600',
  },
  disabledButton: {
    color: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  inputSection: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
  },
  emojiButton: {
    marginRight: 8,
  },
  selectedEmoji: {
    fontSize: 32,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  inputWithEmoji: {
    paddingTop: 8,
  },
  counterContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  counterText: {
    fontSize: 13,
    color: '#999',
  },
  counterTextError: {
    color: '#f44336',
    fontWeight: '600',
  },
  emojiSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  emojiCard: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  emojiIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  clearButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f44336',
  },
  infoSection: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#999',
  },
});
