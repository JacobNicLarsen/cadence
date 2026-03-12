import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="habits-list"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="session"
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="habit"
            options={{ presentation: 'modal' }}
          />
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
