import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import { formatTimer } from '@/utils/format';

type TimerDisplayProps = {
  segmentName: string;
  segmentType: 'activity' | 'pause';
  remaining: number;
  total: number;
};

const RING_SIZE = 220;
const RING_BORDER = 4;

export const TimerDisplay = ({
  segmentName,
  segmentType,
  remaining,
  total,
}: TimerDisplayProps) => {
  const colors = useThemeColors();
  const progress = useSharedValue(total > 0 ? (total - remaining) / total : 0);
  const pulseScale = useSharedValue(1);

  const phaseColor = segmentType === 'pause' ? colors.pause : colors.activity;

  useEffect(() => {
    progress.value = withTiming(total > 0 ? (total - remaining) / total : 0, {
      duration: 300,
    });
  }, [remaining, total, progress]);

  useEffect(() => {
    if (remaining <= 5 && remaining > 0) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
        -1,
        false,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [remaining, pulseScale]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const ringPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const fontFamily = Platform.select({
    ios: 'ui-rounded',
    default: 'normal',
    web: "var(--font-rounded, 'SF Pro Rounded', sans-serif)",
  });

  return (
    <View className="items-center gap-4">
      <Text
        className="text-sm font-semibold uppercase tracking-widest"
        style={{ color: phaseColor }}>
        {segmentType === 'pause' ? 'PAUSE' : 'ACTIVITY'}
      </Text>
      <Text className="text-center text-xl font-semibold">{segmentName}</Text>

      <Animated.View
        style={[
          {
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth: RING_BORDER,
            borderColor: phaseColor,
          },
          ringPulseStyle,
        ]}
        className="items-center justify-center">
        <Text
          className="text-7xl font-extralight"
          style={{ fontFamily, fontVariant: ['tabular-nums'] }}>
          {formatTimer(remaining)}
        </Text>
      </Animated.View>

      <View className="h-2 w-full overflow-hidden rounded-full bg-card">
        <Animated.View
          className="h-full rounded-full"
          style={[{ backgroundColor: phaseColor }, progressStyle]}
        />
      </View>
    </View>
  );
};
