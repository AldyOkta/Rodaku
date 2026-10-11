import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
export { ErrorBoundary } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useFonts, PlusJakartaSans_700Bold, PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { getDatabase } from '../src/db/database';
import ExplodedWheelSplash from '../src/components/ExplodedWheelSplash';

import * as Updates from 'expo-updates';

import { checkAndTriggerReminderNotifications } from '../src/services/notifications';

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // Initialize SQLite database and seed on startup
    try {
      getDatabase();
      checkAndTriggerReminderNotifications();
    } catch (e) {
      console.error('Failed to initialize database or notifications:', e);
    }

    // Check for OTA Updates in standalone/production build
    async function checkForOtaUpdates() {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // Reload silently on next launch or immediately
          await Updates.reloadAsync();
        }
      } catch (err) {
        // Silently ignore if offline
        console.log('OTA update check skipped/failed (offline):', err.message);
      }
    }

    checkForOtaUpdates();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        style={splashFinished ? 'dark' : 'light'}
        backgroundColor={splashFinished ? COLORS.surface : 'transparent'}
        translucent={true}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="records/new"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="records/edit"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="vehicles/new"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="vehicles/edit"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>

      {/* 3D Exploded Wheel Splash Screen (Auto unmounts after animation choreography) */}
      {!splashFinished && (
        <ExplodedWheelSplash
          onFinish={() => {
            if (fontsLoaded) {
              setSplashFinished(true);
            } else {
              // Wait for fonts if taking slightly longer
              const timer = setInterval(() => {
                if (fontsLoaded) {
                  clearInterval(timer);
                  setSplashFinished(true);
                }
              }, 100);
            }
          }}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
