import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import type { Habit } from '@/types/habit';
import { formatDuration, formatScheduledDays, totalDuration } from '@/utils/format';

type HabitCardProps = {
  habit: Habit;
  onPress: () => void;
  index?: number;
};

export const HabitCard = ({ habit, onPress, index = 0 }: HabitCardProps) => {
  const colors = useThemeColors();
  const duration = totalDuration(habit.segments);
  const segmentCount = habit.segments.length;
  const pressed = useSharedValue(0);

  const activityCount = habit.segments.filter((s) => s.type === 'activity').length;
  const isActivityHeavy = activityCount >= habit.segments.length / 2;
  const borderColor = isActivityHeavy ? colors.accent : colors.pause;

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = withTiming(1, { duration: 100 });
    })
    .onFinalize(() => {
      pressed.value = withTiming(0, { duration: 200 });
    })
    .onEnd(() => {
      onPress();
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
  }));

  return (
    <Animated.View entering={FadeIn.delay(index * 80).duration(300)}>
      <GestureDetector gesture={tap}>
        <Animated.View style={animatedStyle}>
          <View
            className="gap-1 rounded-xl bg-card p-4 shadow-sm shadow-black/5"
            style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}>
            <Text className="text-xl font-semibold">{habit.name}</Text>
            <View className="flex-row gap-4">
              <Text className="text-sm text-muted-foreground">{formatDuration(duration)}</Text>
              <Text className="text-sm text-muted-foreground">
                {segmentCount} {segmentCount === 1 ? 'segment' : 'segments'}
              </Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              {formatScheduledDays(habit.scheduledDays)}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};
