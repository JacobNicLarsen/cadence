import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, View } from 'react-native';

import { ExternalLink } from './external-link';

import { Text } from '@/components/ui/text';
import { MaxContentWidth } from '@/constants/theme';
import { useThemeColors } from '@/lib/colors';
import { cn } from '@/lib/utils';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="planner" href="/planner" asChild>
            <TabButton>Planner</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} className="active:opacity-70">
      <View
        className={cn(
          'rounded-xl px-4 py-1',
          isFocused ? 'bg-accent/10' : 'bg-card'
        )}>
        <Text
          className={cn(
            'text-sm font-medium',
            isFocused ? 'text-foreground' : 'text-muted-foreground'
          )}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const colors = useThemeColors();

  return (
    <View
      {...props}
      className="absolute w-full flex-row items-center justify-center p-4">
      <View
        className="flex-grow flex-row items-center gap-2 rounded-full bg-card px-8 py-2"
        style={{ maxWidth: MaxContentWidth }}>
        <Text className="mr-auto text-sm font-semibold">Cadence</Text>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable className="ml-4 flex-row items-center justify-center gap-1">
            <Text className="text-sm">Docs</Text>
            <SymbolView
              tintColor={colors.foreground}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </View>
    </View>
  );
}
