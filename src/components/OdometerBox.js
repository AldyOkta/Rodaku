import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function OdometerBox({ km, label = 'Odometer Saat Ini' }) {
  const formatted = Math.round(Number(km || 0))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="speed" size={14} color={COLORS.secondary} />
          <Text style={styles.labelText}>{label.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.displayFrame}>
        <Text
          style={styles.numberText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {formatted}
        </Text>
        <Text style={styles.unitText}>KM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
  displayFrame: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  numberText: {
    ...TYPOGRAPHY.odometerNum,
    color: COLORS.text,
  },
  unitText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.secondary,
    letterSpacing: 1,
    paddingBottom: 2,
  },
});
