import React, { type ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm">{title}</Text>
      <View className="rounded-md bg-accent/10 px-2 py-1">
        <Text className="text-muted-foreground">{hint}</Text>
      </View>
    </View>
  );
}
