import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { TimerDisplay } from '@/components/timer-display';
import { useHabit } from '@/hooks/use-habit';
import { useThemeColors } from '@/lib/colors';
import { useTimer } from '@/hooks/use-timer';
import { totalDuration } from '@/utils/format';
import type { Segment } from '@/types/habit';

type SessionPhase = 'getReady' | 'active';

const GET_READY_SECONDS = 3;
const SWIPE_THRESHOLD = 80;

export default function ActiveSessionScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habit, loading } = useHabit(id);
  const colors = useThemeColors();
  const [phase, setPhase] = useState<SessionPhase>('getReady');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [slideFrom, setSlideFrom] = useState<'left' | 'right' | null>(null);
  const phaseRef = useRef<SessionPhase>('getReady');
  const segmentIndexRef = useRef(0);

  const segments = habit?.segments ?? [];
  const currentSegment = segments[segmentIndex];
  const nextSegment = segments[segmentIndex + 1];
  const prevSegment = segmentIndex > 0 ? segments[segmentIndex - 1] : undefined;

  const swipeX = useSharedValue(0);
  const swiped = useSharedValue(false);
  const isActive = useSharedValue(false);

  // Timer
  const timerCompleteRef = useRef(() => {});
  const timer = useTimer({
    duration: GET_READY_SECONDS,
    onComplete: () => timerCompleteRef.current(),
  });

  const goToSegment = (index: number, direction: 'left' | 'right') => {
    if (index < 0 || index >= segments.length) return;
    setSlideFrom(direction);
    segmentIndexRef.current = index;
    setSegmentIndex(index);
    const dur = segments[index]?.durationSeconds ?? 0;
    timer.reset(dur);
    timer.start();
  };

  // Ref-based handlers for gesture stability
  const swipeLeftRef = useRef(() => {});
  const swipeRightRef = useRef(() => {});

  swipeLeftRef.current = () => {
    const nextIndex = segmentIndexRef.current + 1;
    if (nextIndex < segments.length) {
      goToSegment(nextIndex, 'right');
    }
  };

  swipeRightRef.current = () => {
    const prevIndex = segmentIndexRef.current - 1;
    if (prevIndex >= 0) {
      goToSegment(prevIndex, 'left');
    }
  };

  timerCompleteRef.current = () => {
    const currentPhase = phaseRef.current;
    const currentIndex = segmentIndexRef.current;

    if (currentPhase === 'getReady') {
      phaseRef.current = 'active';
      isActive.value = true;
      setPhase('active');
      const dur = segments[0]?.durationSeconds ?? 0;
      timer.reset(dur);
      timer.start();
    } else {
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
        goToSegment(currentIndex + 1, 'right');
      }
    }
  };

  // Initial start
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
    Alert.alert('End Session', 'Are you sure you want to stop?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          if (phase === 'active') timer.start();
        },
      },
      {
        text: 'End',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  // Swipe gesture
  const onSwipeLeft = () => swipeLeftRef.current();
  const onSwipeRight = () => swipeRightRef.current();

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onStart(() => {
      swiped.value = false;
    })
    .onUpdate((e) => {
      if (!isActive.value) return;
      swipeX.value = e.translationX;
    })
    .onEnd((e) => {
      if (!isActive.value) {
        swipeX.value = withSpring(0);
        return;
      }
      if (e.translationX < -SWIPE_THRESHOLD) {
        swiped.value = true;
        runOnJS(onSwipeLeft)();
      } else if (e.translationX > SWIPE_THRESHOLD) {
        swiped.value = true;
        runOnJS(onSwipeRight)();
      }
      swipeX.value = withSpring(0, { damping: 20, stiffness: 200 });
    })
    .runOnJS(false);

  // Main content follows the finger
  const swipeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(swipeX.value, [-200, 0, 200], [-40, 0, 40]) },
    ],
    opacity: interpolate(
      Math.abs(swipeX.value),
      [0, SWIPE_THRESHOLD, 200],
      [1, 0.7, 0.5],
    ),
  }));

  // Right edge peek (next segment) — appears when swiping left, hides after commit
  const rightPeekStyle = useAnimatedStyle(() => ({
    opacity: swiped.value ? 0 : interpolate(swipeX.value, [0, -40, -SWIPE_THRESHOLD], [0, 0.4, 1]),
    transform: [
      { translateX: interpolate(swipeX.value, [0, -SWIPE_THRESHOLD, -200], [30, 0, -10]) },
    ],
  }));

  // Left edge peek (prev segment) — appears when swiping right, hides after commit
  const leftPeekStyle = useAnimatedStyle(() => ({
    opacity: swiped.value ? 0 : interpolate(swipeX.value, [0, 40, SWIPE_THRESHOLD], [0, 0.4, 1]),
    transform: [
      { translateX: interpolate(swipeX.value, [0, SWIPE_THRESHOLD, 200], [-30, 0, 10]) },
    ],
  }));

  if (loading || !habit || !currentSegment) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  // Subtle background tint based on segment type
  const segmentColor = currentSegment.type === 'pause' ? colors.pause : colors.activity;
  const bgTint = phase === 'active' ? segmentColor + '06' : 'transparent';

  // Gentle entering animation based on swipe direction
  const enteringAnim =
    slideFrom === 'right'
      ? FadeIn.duration(200)
      : slideFrom === 'left'
        ? FadeIn.duration(200)
        : FadeIn.duration(200);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Subtle color wash */}
      {phase === 'active' ? (
        <Animated.View
          entering={FadeIn.duration(800)}
          style={[StyleSheet.absoluteFill, { backgroundColor: bgTint }]}
        />
      ) : null}

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <EndButton onPress={handleStop} />
          <Text style={[styles.habitName, { color: colors.mutedForeground }]}>
            {habit.name}
          </Text>
          {segments.length > 1 ? (
            <Text style={[styles.stepCounter, { color: colors.mutedForeground }]}>
              {segmentIndex + 1}
              <Text style={{ color: colors.border }}> / </Text>
              {segments.length}
            </Text>
          ) : (
            <View style={styles.headerEndSpacer} />
          )}
        </View>

        {/* Swipeable area */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.swipeArea}>
            {/* Left edge peek — previous segment */}
            {prevSegment ? (
              <Animated.View style={[styles.peekLeft, leftPeekStyle]}>
                <PeekLabel segment={prevSegment} direction="left" />
              </Animated.View>
            ) : null}

            {/* Main content */}
            <Animated.View
              key={`segment-${segmentIndex}`}
              entering={enteringAnim}
              style={[styles.content, swipeStyle]}>
              {phase === 'getReady' ? (
                <GetReadyPhase remaining={timer.remaining} />
              ) : (
                <TimerDisplay
                  segmentName={currentSegment.name || 'Untitled'}
                  segmentType={currentSegment.type}
                  remaining={timer.remaining}
                  total={currentSegment.durationSeconds}
                  nextSegment={
                    nextSegment
                      ? {
                          name: nextSegment.name,
                          type: nextSegment.type,
                          durationSeconds: nextSegment.durationSeconds,
                        }
                      : undefined
                  }
                  isLastSegment={!nextSegment && segments.length > 1}
                />
              )}
            </Animated.View>

            {/* Right edge peek — next segment */}
            {nextSegment ? (
              <Animated.View style={[styles.peekRight, rightPeekStyle]}>
                <PeekLabel segment={nextSegment} direction="right" />
              </Animated.View>
            ) : null}
          </View>
        </GestureDetector>

        {/* Footer */}
        <View style={styles.footer}>
          {phase === 'active' ? (
            <PauseResumeButton isRunning={timer.isRunning} onPress={handlePauseResume} />
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ── Peek Label (edge hint during swipe) ── */

const PeekLabel = ({
  segment,
  direction,
}: {
  segment: Segment;
  direction: 'left' | 'right';
}) => {
  const colors = useThemeColors();
  const accentColor = segment.type === 'pause' ? colors.pause : colors.activity;
  const isLeft = direction === 'left';

  return (
    <View style={[styles.peekCard, { backgroundColor: accentColor + '12' }]}>
      <SymbolView
        name={isLeft ? 'chevron.left' : 'chevron.right'}
        size={12}
        tintColor={accentColor}
      />
      <View style={styles.peekTextGroup}>
        <Text style={[styles.peekType, { color: accentColor }]}>
          {segment.type === 'pause' ? 'Rest' : 'Focus'}
        </Text>
        <Text style={[styles.peekName, { color: colors.foreground }]} numberOfLines={1}>
          {segment.name || 'Untitled'}
        </Text>
      </View>
    </View>
  );
};

/* ── Get Ready Phase ── */

const GetReadyPhase = ({ remaining }: { remaining: number }) => {
  const colors = useThemeColors();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 500 }),
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
    <Animated.View entering={FadeIn.duration(300)} style={styles.getReadyContainer}>
      <Text style={[styles.getReadyLabel, { color: colors.warning }]}>
        GET READY
      </Text>
      <Animated.View style={pulseStyle}>
        <Text style={[styles.getReadyCount, { color: colors.foreground, fontFamily: 'ui-rounded' }]}>
          {remaining}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

/* ── End Button ── */

const EndButton = ({ onPress }: { onPress: () => void }) => {
  const colors = useThemeColors();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [1, 0.5]),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 60 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 150 });
      }}
      hitSlop={12}
      accessibilityLabel="End session"
      accessibilityRole="button">
      <Animated.View style={[animatedStyle, styles.endButton]}>
        <SymbolView name="xmark" size={14} tintColor={colors.mutedForeground} />
        <Text style={[styles.endButtonText, { color: colors.mutedForeground }]}>
          End
        </Text>
      </Animated.View>
    </Pressable>
  );
};

/* ── Pause / Resume Button ── */

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
      }}
      accessibilityLabel={isRunning ? 'Pause session' : 'Resume session'}
      accessibilityRole="button">
      <Animated.View
        style={[animatedStyle, styles.pauseButton, { backgroundColor: colors.card }]}>
        <SymbolView
          name={isRunning ? 'pause.fill' : 'play.fill'}
          size={18}
          tintColor={colors.foreground}
        />
        <Text style={[styles.pauseButtonText, { color: colors.foreground }]}>
          {isRunning ? 'Pause' : 'Resume'}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

/* ── Styles ── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingRight: 8,
  },
  endButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  habitName: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepCounter: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    minWidth: 40,
    textAlign: 'right',
  },
  headerEndSpacer: {
    minWidth: 40,
  },
  swipeArea: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  peekLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
  peekRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
  peekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  peekTextGroup: {
    gap: 1,
  },
  peekType: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  peekName: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 80,
  },
  getReadyContainer: {
    alignItems: 'center',
    gap: 16,
  },
  getReadyLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  getReadyCount: {
    fontSize: 80,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    lineHeight: 90,
  },
  footer: {
    alignItems: 'center',
    minHeight: 48,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  pauseButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
