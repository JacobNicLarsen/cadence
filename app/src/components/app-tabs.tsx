import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

import { useThemeColors } from '@/lib/colors';

export default function AppTabs() {
  const colors = useThemeColors();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.card}
      labelStyle={{ selected: { color: colors.foreground } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="planner">
        <NativeTabs.Trigger.Label>Planner</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
