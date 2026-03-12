import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useHabits } from '@/hooks/use-habits';
import { useThemeColors } from '@/lib/colors';
import type { Habit } from '@/types/habit';
import { formatDuration, formatScheduledDays, totalDuration } from '@/utils/format';

export default function HabitsListScreen() {
  const { habits, loading, refresh } = useHabits();
  const router = useRouter();
  const colors = useThemeColors();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleEdit = (habit: Habit) => {
    router.push(`/habit/${habit.id}`);
  };

  return (
    <View style={styles.container} className="bg-background">
      <SafeAreaView style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily: 'ui-rounded' }]}>
            Habits
          </Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.closeButton}
            accessibilityLabel="Close"
            accessibilityRole="button">
            <SymbolView name="xmark.circle.fill" size={28} tintColor={colors.mutedForeground} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            [0, 1, 2].map((i) => (
              <SkeletonRow key={i} index={i} colors={colors} />
            ))
          ) : habits.length > 0 ? (
            habits.map((habit, index) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onPress={() => handleEdit(habit)}
                index={index}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No habits yet
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const SkeletonRow = ({
  index,
  colors,
}: {
  index: number;
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 80).duration(250)}
      style={[styles.row, { borderBottomColor: colors.border }]}>
      <Animated.View style={animatedStyle}>
        <View style={styles.skeletonRowInner}>
          <View style={[styles.skeletonDot, { backgroundColor: colors.border }]} />
          <View style={styles.skeletonLines}>
            <View style={[styles.skeletonLine, { width: '55%', backgroundColor: colors.border }]} />
            <View style={[styles.skeletonLine, { width: '80%', backgroundColor: colors.border }]} />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const HabitRow = ({
  habit,
  onPress,
  index,
}: {
  habit: Habit;
  onPress: () => void;
  index: number;
}) => {
  const colors = useThemeColors();
  const pressed = useSharedValue(0);

  const activityCount = habit.segments.filter((s) => s.type === 'activity').length;
  const isActivityHeavy = activityCount >= habit.segments.length / 2;
  const accentColor = isActivityHeavy ? colors.activity : colors.pause;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.8]),
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(250)}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 80 });
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, { duration: 150 });
        }}
        accessibilityLabel={`Edit ${habit.name}`}
        accessibilityRole="button">
        <Animated.View style={animatedStyle}>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={[styles.dot, { backgroundColor: accentColor }]} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowName, { color: colors.foreground }]}>
                {habit.name}
              </Text>
              <View style={styles.rowMeta}>
                <Text style={[styles.rowMetaText, { color: colors.mutedForeground }]}>
                  {formatDuration(totalDuration(habit.segments))}
                </Text>
                <Text style={[styles.rowDot, { color: colors.mutedForeground }]}>·</Text>
                <Text style={[styles.rowMetaText, { color: colors.mutedForeground }]}>
                  {habit.segments.length} {habit.segments.length === 1 ? 'segment' : 'segments'}
                </Text>
                <Text style={[styles.rowDot, { color: colors.mutedForeground }]}>·</Text>
                <Text style={[styles.rowMetaText, { color: colors.mutedForeground }]}>
                  {formatScheduledDays(habit.scheduledDays)}
                </Text>
              </View>
            </View>
            <SymbolView name="chevron.right" size={12} tintColor={colors.mutedForeground} />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowMetaText: {
    fontSize: 13,
  },
  rowDot: {
    fontSize: 13,
  },
  skeletonRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skeletonLines: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
  },
});
