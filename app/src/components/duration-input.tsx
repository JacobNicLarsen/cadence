import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';

const MIN_SECONDS = 5;
const MAX_SECONDS = 3600;

type DurationInputProps = {
  value: number;
  onChange: (seconds: number) => void;
};

export const DurationInput = ({ value, onChange }: DurationInputProps) => {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  const clamp = (v: number) => Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, v));

  const adjustMinutes = (delta: number) => {
    onChange(clamp(value + delta * 60));
  };

  const adjustSeconds = (delta: number) => {
    const next = value + delta * 5;
    onChange(clamp(next));
  };

  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row items-center gap-1">
        <StepperButton icon="minus" onPress={() => adjustMinutes(-1)} />
        <View className="min-w-[40px] items-center rounded-md border border-border px-2 py-2">
          <Text className="text-sm font-semibold">{String(minutes).padStart(2, '0')}</Text>
        </View>
        <StepperButton icon="plus" onPress={() => adjustMinutes(1)} />
      </View>
      <Text className="text-sm text-muted-foreground">:</Text>
      <View className="flex-row items-center gap-1">
        <StepperButton icon="minus" onPress={() => adjustSeconds(-1)} />
        <View className="min-w-[40px] items-center rounded-md border border-border px-2 py-2">
          <Text className="text-sm font-semibold">{String(seconds).padStart(2, '0')}</Text>
        </View>
        <StepperButton icon="plus" onPress={() => adjustSeconds(1)} />
      </View>
    </View>
  );
};

const StepperButton = ({
  icon,
  onPress,
}: {
  icon: 'minus' | 'plus';
  onPress: () => void;
}) => {
  const colors = useThemeColors();
  const pressed = useSharedValue(0);

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = withTiming(1, { duration: 60 });
    })
    .onFinalize(() => {
      pressed.value = withTiming(0, { duration: 150 });
    })
    .onEnd(() => {
      onPress();
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.85]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.7]),
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[animatedStyle, { backgroundColor: colors.card }]}
        className="h-9 w-9 items-center justify-center rounded-full">
        <SymbolView name={icon} size={14} tintColor={colors.mutedForeground} />
      </Animated.View>
    </GestureDetector>
  );
};
