import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';

export interface SettingsItem {
  id: string;
  icon: string;
  label: string;
  value?: string;
  type: 'navigation' | 'toggle' | 'info';
  onPress?: () => void;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

interface SettingsSectionProps {
  title: string;
  items: SettingsItem[];
}

export function SettingsSection({ title, items }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={item.id}>
            {item.type === 'toggle' ? (
              <View style={styles.item}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <Switch
                  value={item.toggleValue}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#ddd', true: '#3498db' }}
                  thumbColor="#fff"
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.item}
                onPress={item.onPress}
                disabled={item.type === 'info'}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.itemLabel,
                      item.danger && styles.itemLabelDanger,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  {item.value && (
                    <Text style={styles.itemValue}>{item.value}</Text>
                  )}
                  {item.type === 'navigation' && (
                    <Text style={styles.chevron}>›</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            {index < items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  itemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  itemLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  itemLabelDanger: {
    color: '#e74c3c',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 14,
    color: '#95a5a6',
    marginRight: 8,
  },
  chevron: {
    fontSize: 24,
    color: '#bdc3c7',
  },
  separator: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginLeft: 52,
  },
});
