import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  SlideInLeft,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import { saveSessionRecord } from '@/storage/session-storage';
import { formatDuration } from '@/utils/format';
import { generateId } from '@/utils/id';

export default function CompleteScreen() {
  const { habitId, habitName, totalDuration, segmentsCompleted } = useLocalSearchParams<{
    habitId: string;
    habitName: string;
    totalDuration: string;
    segmentsCompleted: string;
  }>();
  const router = useRouter();
  const colors = useThemeColors();
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    saveSessionRecord({
      id: generateId(),
      habitId,
      habitName,
      completedAt: Date.now(),
      totalDurationSeconds: Number(totalDuration),
      segmentsCompleted: Number(segmentsCompleted),
    });
  }, [habitId, habitName, totalDuration, segmentsCompleted]);

  const handleDone = () => {
    router.dismissAll();
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 p-6">
        <View className="flex-1 items-center justify-center gap-6">
          <View className="h-24 w-24 items-center justify-center">
            <RippleRing color={colors.success} />
            <Animated.View
              entering={ZoomIn.duration(400)}
              className="h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.success }}>
              <SymbolView name="checkmark" size={40} tintColor="#ffffff" />
            </Animated.View>
          </View>

          <Animated.View entering={FadeIn.delay(200).duration(400)}>
            <Text className="text-center text-3xl font-bold" style={{ fontFamily: 'ui-rounded' }}>
              Complete!
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <Text className="text-center text-xl font-semibold text-muted-foreground">
              {habitName}
            </Text>
          </Animated.View>

          <View className="flex-row gap-4">
            <Animated.View entering={SlideInLeft.delay(400).duration(300)}>
              <View className="min-w-[130px] items-center gap-1 rounded-xl bg-card p-4 shadow-sm shadow-black/5">
                <SymbolView name="clock" size={20} tintColor={colors.accent} />
                <Text className="text-xl font-semibold">
                  {formatDuration(Number(totalDuration))}
                </Text>
                <Text className="text-sm text-muted-foreground">Duration</Text>
              </View>
            </Animated.View>
            <Animated.View entering={SlideInLeft.delay(500).duration(300)}>
              <View className="min-w-[130px] items-center gap-1 rounded-xl bg-card p-4 shadow-sm shadow-black/5">
                <SymbolView name="checkmark.circle" size={20} tintColor={colors.success} />
                <Text className="text-xl font-semibold">{segmentsCompleted}</Text>
                <Text className="text-sm text-muted-foreground">
                  {Number(segmentsCompleted) === 1 ? 'Segment' : 'Segments'}
                </Text>
              </View>
            </Animated.View>
          </View>

          <ConfettiParticles />
        </View>

        <Animated.View entering={FadeIn.delay(600).duration(400)}>
          <DoneButton onPress={handleDone} color={colors.success} />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const RippleRing = ({ color }: { color: string }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(2, { duration: 1200 }),
          withTiming(1, { duration: 0 }),
        ),
        3,
        false,
      ),
    );
    opacity.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 1200 }),
          withTiming(0.3, { duration: 0 }),
        ),
        3,
        false,
      ),
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="absolute h-24 w-24 rounded-full"
      style={[{ borderWidth: 2, borderColor: color }, animatedStyle]}
    />
  );
};

const ConfettiParticles = () => {
  const colors = useThemeColors();
  const particleColors = [colors.accent, colors.success, colors.warning, colors.pause];

  return (
    <View className="absolute h-2.5 w-2.5 self-center" pointerEvents="none">
      {particleColors.map((color, i) => (
        <ConfettiDot key={i} color={color} index={i} />
      ))}
    </View>
  );
};

const ConfettiDot = ({ color, index }: { color: string; index: number }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const xOffset = (index % 2 === 0 ? -1 : 1) * (30 + index * 20);
  const delay = 300 + index * 100;

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(-120 - index * 30, { duration: 1000 }));
    translateX.value = withDelay(delay, withTiming(xOffset, { duration: 1000 }));
    opacity.value = withDelay(delay, withTiming(0, { duration: 1200 }));
  }, [translateY, translateX, opacity, xOffset, delay, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="absolute h-2 w-2 rounded-full"
      style={[{ backgroundColor: color }, animatedStyle]}
    />
  );
};

const DoneButton = ({ onPress, color }: { onPress: () => void; color: string }) => {
  const pressed = useSharedValue(0);

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = withTiming(1, { duration: 80 });
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
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[animatedStyle, { backgroundColor: color }]}
        className="items-center rounded-md py-4 shadow-sm shadow-black/5">
        <Text className="text-base font-semibold text-white">Done</Text>
      </Animated.View>
    </GestureDetector>
  );
};
