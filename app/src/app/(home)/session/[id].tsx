import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SegmentProgress } from '@/components/segment-progress';
import { Text } from '@/components/ui/text';
import { TimerDisplay } from '@/components/timer-display';
import { useHabit } from '@/hooks/use-habit';
import { useThemeColors } from '@/lib/colors';
import { useTimer } from '@/hooks/use-timer';
import { totalDuration } from '@/utils/format';

type SessionPhase = 'getReady' | 'active' | 'transition';

const GET_READY_SECONDS = 5;
const TRANSITION_SECONDS = 3;

export default function ActiveSessionScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habit, loading } = useHabit(id);

  const [phase, setPhase] = useState<SessionPhase>('getReady');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const phaseRef = useRef<SessionPhase>('getReady');
  const segmentIndexRef = useRef(0);

  const segments = habit?.segments ?? [];
  const currentSegment = segments[segmentIndex];

  const getTimerDuration = () => {
    if (phase === 'getReady') return GET_READY_SECONDS;
    if (phase === 'transition') return TRANSITION_SECONDS;
    return currentSegment?.durationSeconds ?? 0;
  };

  const handleTimerComplete = useCallback(() => {
    const currentPhase = phaseRef.current;
    const currentIndex = segmentIndexRef.current;

    if (currentPhase === 'getReady') {
      phaseRef.current = 'active';
      setPhase('active');
    } else if (currentPhase === 'active') {
      const isLast = habit ? currentIndex >= habit.segments.length - 1 : true;
      if (isLast) {
        if (!habit) return;
        router.replace({
          pathname: '/session/complete',
          params: {
            habitId: habit.id,
            habitName: habit.name,
            totalDuration: String(totalDuration(habit.segments)),
            segmentsCompleted: String(habit.segments.length),
          },
        });
      } else {
        const nextIndex = currentIndex + 1;
        segmentIndexRef.current = nextIndex;
        setSegmentIndex(nextIndex);
        phaseRef.current = 'transition';
        setPhase('transition');
      }
    } else if (currentPhase === 'transition') {
      phaseRef.current = 'active';
      setPhase('active');
    }
  }, [habit, router]);

  const timer = useTimer({
    duration: getTimerDuration(),
    onComplete: handleTimerComplete,
  });

  const prevPhaseRef = useRef<string>('');
  const prevIndexRef = useRef<number>(-1);

  useEffect(() => {
    const key = `${phase}-${segmentIndex}`;
    const prevKey = `${prevPhaseRef.current}-${prevIndexRef.current}`;

    if (key !== prevKey) {
      prevPhaseRef.current = phase;
      prevIndexRef.current = segmentIndex;

      let duration = GET_READY_SECONDS;
      if (phase === 'active') {
        duration = segments[segmentIndex]?.durationSeconds ?? 0;
      } else if (phase === 'transition') {
        duration = TRANSITION_SECONDS;
      }
      timer.reset(duration);
      timer.start();
    }
  }, [phase, segmentIndex, segments, timer]);

  const didStart = useRef(false);
  useEffect(() => {
    if (habit && !didStart.current) {
      didStart.current = true;
      timer.reset(GET_READY_SECONDS);
      timer.start();
    }
  }, [habit, timer]);

  const handlePauseResume = () => {
    if (phase !== 'active') return;
    if (timer.isRunning) {
      timer.pause();
    } else {
      timer.start();
    }
  };

  const handleStop = () => {
    timer.pause();
    Alert.alert('Stop Session', 'Are you sure you want to stop?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          if (phase === 'active') timer.start();
        },
      },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  if (loading || !habit || !currentSegment) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 p-6">
        <View className="flex-row justify-end">
          <StopButton onPress={handleStop} />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          {phase === 'getReady' ? (
            <GetReadyPhase remaining={timer.remaining} />
          ) : phase === 'transition' ? (
            <TransitionPhase segment={currentSegment} />
          ) : (
            <TimerDisplay
              segmentName={currentSegment.name || 'Untitled'}
              segmentType={currentSegment.type}
              remaining={timer.remaining}
              total={currentSegment.durationSeconds}
            />
          )}
        </View>

        <View className="items-center gap-6">
          <SegmentProgress total={segments.length} current={segmentIndex} />
          {phase === 'active' ? (
            <PauseResumeButton isRunning={timer.isRunning} onPress={handlePauseResume} />
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const GetReadyPhase = ({ remaining }: { remaining: number }) => {
  const colors = useThemeColors();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      false,
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} className="items-center gap-4">
      <Text
        className="text-sm font-semibold uppercase tracking-widest"
        style={{ color: colors.warning }}>
        GET READY
      </Text>
      <Animated.View style={pulseStyle}>
        <Text
          className="text-7xl font-extralight"
          style={{ fontFamily: 'ui-rounded', fontVariant: ['tabular-nums'] }}>
          {remaining}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const TransitionPhase = ({
  segment,
}: {
  segment: { name: string; type: 'activity' | 'pause' };
}) => {
  const colors = useThemeColors();
  const phaseColor = segment.type === 'pause' ? colors.pause : colors.activity;

  return (
    <Animated.View entering={SlideInRight.duration(300)} className="items-center gap-4">
      <Text className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        NEXT UP
      </Text>
      <Text className="text-3xl font-bold" style={{ fontFamily: 'ui-rounded' }}>
        {segment.name || 'Untitled'}
      </Text>
      <View className="rounded-full px-4 py-1" style={{ backgroundColor: phaseColor + '20' }}>
        <Text className="text-sm font-semibold" style={{ color: phaseColor }}>
          {segment.type === 'pause' ? 'Pause' : 'Activity'}
        </Text>
      </View>
    </Animated.View>
  );
};

const StopButton = ({ onPress }: { onPress: () => void }) => {
  const colors = useThemeColors();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.85]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.6]),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 60 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 150 });
      }}>
      <Animated.View style={animatedStyle} className="p-2">
        <SymbolView name="xmark.circle.fill" size={28} tintColor={colors.mutedForeground} />
      </Animated.View>
    </Pressable>
  );
};

const PauseResumeButton = ({
  isRunning,
  onPress,
}: {
  isRunning: boolean;
  onPress: () => void;
}) => {
  const colors = useThemeColors();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.95]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 80 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 200 });
      }}>
      <Animated.View
        style={[animatedStyle, { backgroundColor: colors.card }]}
        className="flex-row items-center gap-2 rounded-full px-6 py-2">
        <SymbolView
          name={isRunning ? 'pause.fill' : 'play.fill'}
          size={18}
          tintColor={colors.foreground}
        />
        <Text className="text-sm font-semibold">{isRunning ? 'Pause' : 'Resume'}</Text>
      </Animated.View>
    </Pressable>
  );
};
