import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitCard } from '@/components/habit-card';
import { Text } from '@/components/ui/text';
import { BottomTabInset } from '@/constants/theme';
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

const getTodayKey = (): DayOfWeek => DAY_MAP[new Date().getDay()];
const getTodayName = (): string => DAY_NAMES[new Date().getDay()];

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

  const handlePress = (habit: Habit) => {
    router.push(`/session/${habit.id}`);
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView style={{ flex: 1, paddingBottom: BottomTabInset }}>
        <View className="gap-0.5 px-6 pb-4 pt-6">
          <Text className="text-3xl font-bold" style={{ fontFamily: 'ui-rounded' }}>
            Today
          </Text>
          <Text className="text-sm text-muted-foreground">{getTodayName()}</Text>
        </View>
        <FlatList
          data={todaysHabits}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <HabitCard habit={item} onPress={() => handlePress(item)} index={index} />
          )}
          contentContainerClassName="px-6 pb-6"
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={
            loading ? null : (
              <View className="items-center gap-4 pt-16">
                <SymbolView name="calendar" size={44} tintColor={colors.mutedForeground} />
                <Text className="text-center text-muted-foreground">
                  No habits scheduled for today
                </Text>
                <Pressable
                  onPress={() => router.push('/planner/new')}
                  className="rounded-lg bg-primary/10 px-4 py-2">
                  <Text className="text-sm font-semibold text-primary">Go to Planner</Text>
                </Pressable>
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}
