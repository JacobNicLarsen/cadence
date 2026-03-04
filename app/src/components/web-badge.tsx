import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import React from 'react';
import { useColorScheme, View } from 'react-native';

import { Text } from '@/components/ui/text';

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <View className="items-center gap-2 p-8">
      <Text className="text-center text-xs font-semibold text-muted-foreground">v{version}</Text>
      <Image
        source={
          scheme === 'dark'
            ? require('@/assets/images/expo-badge-white.png')
            : require('@/assets/images/expo-badge.png')
        }
        style={{ width: 123, aspectRatio: 123 / 24 }}
      />
    </View>
  );
}
