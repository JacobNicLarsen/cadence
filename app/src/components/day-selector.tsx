import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import { cn } from '@/lib/utils';
import type { DayOfWeek } from '@/types/habit';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

type DaySelectorProps = {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
};

const DayButton = ({
  dayKey,
  label,
  isSelected,
  onToggle,
}: {
  dayKey: DayOfWeek;
  label: string;
  isSelected: boolean;
  onToggle: (day: DayOfWeek) => void;
}) => {
  const colors = useThemeColors();
  const pressed = useSharedValue(0);

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = withTiming(1, { duration: 80 });
    })
    .onFinalize(() => {
      pressed.value = withTiming(0, { duration: 150 });
    })
    .onEnd(() => {
      onToggle(dayKey);
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.9]) }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          animatedStyle,
          isSelected
            ? { backgroundColor: colors.accent }
            : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
        ]}
        className="h-11 w-11 items-center justify-center rounded-full">
        <Text
          className={cn('text-sm font-semibold', isSelected ? 'text-white' : 'text-muted-foreground')}>
          {label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
};

export const DaySelector = ({ selected, onChange }: DaySelectorProps) => {
  const toggle = (day: DayOfWeek) => {
    if (selected.includes(day)) {
      if (selected.length <= 1) return;
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <View className="flex-row gap-2">
      {DAYS.map(({ key, label }) => (
        <DayButton
          key={key}
          dayKey={key}
          label={label}
          isSelected={selected.includes(key)}
          onToggle={toggle}
        />
      ))}
    </View>
  );
};
