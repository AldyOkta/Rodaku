import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SERVICE_THEMES, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function ServiceBadge({ type, size = 'md' }) {
  const theme = SERVICE_THEMES[type] || SERVICE_THEMES.lainnya;
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 10,
        },
      ]}
    >
      <MaterialIcons name={theme.icon} size={isSm ? 12 : 14} color={theme.text} />
      <Text
        style={[
          styles.text,
          {
            color: theme.text,
            fontSize: isSm ? 10 : 11,
          },
        ]}
      >
        {theme.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.labelSm,
  },
});
