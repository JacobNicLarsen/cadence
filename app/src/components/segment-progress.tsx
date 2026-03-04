import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';

type SegmentProgressProps = {
  total: number;
  current: number;
};

export const SegmentProgress = ({ total, current }: SegmentProgressProps) => {
  const colors = useThemeColors();

  return (
    <View className="items-center gap-2">
      <View className="flex-row items-center gap-2">
        {Array.from({ length: total }, (_, i) => {
          if (i === current) {
            return <ActiveDot key={i} color={colors.accent} />;
          }
          const isCompleted = i < current;
          return (
            <View
              key={i}
              className="h-3 w-3 rounded-full"
              style={
                isCompleted
                  ? { backgroundColor: colors.success }
                  : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border }
              }
            />
          );
        })}
      </View>
      <Text className="text-sm text-muted-foreground">
        Step <Text className="text-sm font-semibold">{current + 1}</Text> of{' '}
        <Text className="text-sm font-semibold">{total}</Text>
      </Text>
    </View>
  );
};

const ActiveDot = ({ color }: { color: string }) => {
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);

  useEffect(() => {
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, [ringScale, ringOpacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View className="h-3 w-3 items-center justify-center">
      <Animated.View
        className="absolute h-3 w-3 rounded-full"
        style={[{ borderWidth: 2, borderColor: color }, ringStyle]}
      />
      <View className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
    </View>
  );
};
