import { SymbolView } from 'expo-symbols';
import { PropsWithChildren, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useThemeColors();

  return (
    <View>
      <Pressable
        className="flex-row items-center gap-2 active:opacity-70"
        onPress={() => setIsOpen((value) => !value)}>
        <View className="h-6 w-6 items-center justify-center rounded-xl bg-card">
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            weight="bold"
            tintColor={colors.foreground}
            style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}
          />
        </View>
        <Text className="text-sm">{title}</Text>
      </Pressable>
      {isOpen ? (
        <Animated.View entering={FadeIn.duration(200)}>
          <View className="ml-6 mt-4 rounded-xl bg-card p-6">{children}</View>
        </Animated.View>
      ) : null}
    </View>
  );
}
