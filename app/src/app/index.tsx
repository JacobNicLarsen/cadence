import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { HabitCard } from '@/components/habit-card';
import { Text } from '@/components/ui/text';
import { useHabits } from '@/hooks/use-habits';
import { useThemeColors } from '@/lib/colors';
import type { DayOfWeek, Habit } from '@/types/habit';

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getTodayKey = (): DayOfWeek => DAY_MAP[new Date().getDay()];

const getFormattedDate = (): string => {
  const now = new Date();
  return `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`;
};

export default function HomeScreen() {
  const { habits, loading, refresh } = useHabits();
  const router = useRouter();
  const colors = useThemeColors();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const todayKey = getTodayKey();
  const todaysHabits = useMemo(
    () => habits.filter((h) => h.scheduledDays.includes(todayKey)),
    [habits, todayKey],
  );

  const handleStart = (habit: Habit) => {
    router.push(`/session/${habit.id}`);
  };

  const handleEdit = (habit: Habit) => {
    router.push(`/habit/${habit.id}`);
  };

  const handleCreate = () => {
    router.push('/habit/new');
  };

  return (
    <View style={styles.container} className="bg-background">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { fontFamily: 'ui-rounded' }]}>
              Today
            </Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {getFormattedDate()}
            </Text>
          </View>
          {habits.length > 0 ? (
            <Pressable
              onPress={() => router.push('/habits-list')}
              hitSlop={8}
              style={styles.manageButton}
              accessibilityLabel="Manage habits"
              accessibilityRole="button">
              <SymbolView name="list.bullet" size={20} tintColor={colors.foreground} />
            </Pressable>
          ) : null}
        </Animated.View>

        {/* Today's Habits */}
        {loading ? (
          <View style={styles.section}>
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} index={i} colors={colors} />
            ))}
          </View>
        ) : todaysHabits.length > 0 ? (
          <View style={styles.section}>
            {todaysHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onPress={() => handleStart(habit)}
                onEdit={() => handleEdit(habit)}
                index={index}
              />
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <SymbolView name="sun.max" size={32} tintColor={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Nothing scheduled today
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Tap + to create your first habit
            </Text>
          </Animated.View>
        )}
      </ScrollView>
      </SafeAreaView>

      {/* FAB */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(400).springify()}
        style={styles.fabContainer}>
        <FAB onPress={handleCreate} color={colors.accent} />
      </Animated.View>
    </View>
  );
}

const SkeletonCard = ({
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
      entering={FadeIn.delay(index * 100).duration(300)}
      style={[styles.skeletonCard, { backgroundColor: colors.muted }]}>
      <Animated.View style={animatedStyle}>
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonCircle, { backgroundColor: colors.border }]} />
          <View style={styles.skeletonLines}>
            <View style={[styles.skeletonLine, styles.skeletonLineWide, { backgroundColor: colors.border }]} />
            <View style={[styles.skeletonLine, styles.skeletonLineNarrow, { backgroundColor: colors.border }]} />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const FAB = ({ onPress, color }: { onPress: () => void; color: string }) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.9]) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, { damping: 12, stiffness: 200 });
      }}
      accessibilityLabel="Create new habit"
      accessibilityRole="button">
      <Animated.View style={[animatedStyle, styles.fab, { backgroundColor: color }]}>
        <SymbolView name="plus" size={24} tintColor="#ffffff" />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerText: {
    gap: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 41,
  },
  date: {
    fontSize: 15,
    fontWeight: '500',
  },
  manageButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  skeletonCard: {
    borderRadius: 16,
    padding: 18,
    height: 80,
    justifyContent: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  skeletonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  skeletonLines: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  skeletonLineWide: {
    width: '70%',
  },
  skeletonLineNarrow: {
    width: '45%',
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 48 : 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
