import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { Segment } from '@/types/habit';
import { formatDuration } from '@/utils/format';

type SegmentRowProps = {
  segment: Segment;
  onDelete: () => void;
};

export const SegmentRow = ({ segment, onDelete }: SegmentRowProps) => {
  return (
    <View className="flex-row items-center rounded-md bg-card p-2">
      <View className="flex-1 gap-1">
        <Text className="text-sm font-semibold">{segment.name || 'Untitled'}</Text>
        <View className="flex-row items-center gap-2">
          <View
            className={
              segment.type === 'pause'
                ? 'rounded-sm bg-accent/10 px-2 py-1'
                : 'rounded-sm bg-card px-2 py-1'
            }>
            <Text className="text-sm text-muted-foreground">{segment.type}</Text>
          </View>
          <Text className="text-sm text-muted-foreground">
            {formatDuration(segment.durationSeconds)}
          </Text>
        </View>
      </View>
      <Pressable onPress={onDelete} hitSlop={8} className="p-2 active:opacity-50">
        <Text className="text-muted-foreground">&#x2715;</Text>
      </Pressable>
    </View>
  );
};
