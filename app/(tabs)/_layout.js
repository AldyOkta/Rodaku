import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../../src/constants/theme';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Garasi',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="two-wheeler" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add_placeholder"
        options={{
          title: 'Catat',
          tabBarButton: () => (
            <View style={styles.fabContainer}>
              <TouchableOpacity
                style={styles.fabButton}
                activeOpacity={0.85}
                onPress={() => router.push('/records/new')}
                accessibilityRole="button"
                accessibilityLabel="Catat Servis Cepat"
              >
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.fabLabel}>Catat</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Pengingat',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications-active" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analitik',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 86 : 68,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: FONTS.headingSemiBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -16,
  },
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  fabLabel: {
    fontFamily: FONTS.headingSemiBold,
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },
});
