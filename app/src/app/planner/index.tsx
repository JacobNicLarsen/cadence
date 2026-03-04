import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { BottomTabInset } from '@/constants/theme';
import { useHabits } from '@/hooks/use-habits';
import { useThemeColors } from '@/lib/colors';
import type { Habit } from '@/types/habit';
import { formatDuration, formatScheduledDays, totalDuration } from '@/utils/format';

export default function PlannerListScreen() {
  const { habits, loading, refresh } = useHabits();
  const router = useRouter();
  const colors = useThemeColors();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleEdit = (habit: Habit) => {
    router.push(`/planner/${habit.id}`);
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView style={{ flex: 1, paddingBottom: BottomTabInset }}>
        <View className="flex-row items-center justify-between px-6 pb-4 pt-6">
          <Text className="text-3xl font-bold" style={{ fontFamily: 'ui-rounded' }}>
            Planner
          </Text>
          <GestureDetector
            gesture={Gesture.Tap()
              .onEnd(() => router.push('/planner/new'))
              .runOnJS(true)}>
            <View
              className="h-11 w-11 items-center justify-center rounded-full shadow-sm shadow-black/5"
              style={{ backgroundColor: colors.accent }}>
              <SymbolView name="plus" size={18} tintColor="#ffffff" />
            </View>
          </GestureDetector>
        </View>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PlannerRow habit={item} index={index} onPress={() => handleEdit(item)} />
          )}
          contentContainerClassName="px-6 pb-6"
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={
            loading ? null : (
              <View className="items-center gap-4 pt-16">
                <SymbolView
                  name="list.bullet.rectangle"
                  size={44}
                  tintColor={colors.mutedForeground}
                />
                <Text className="text-center text-muted-foreground">
                  Create your first habit to get started.
                </Text>
                <GestureDetector
                  gesture={Gesture.Tap()
                    .onEnd(() => router.push('/planner/new'))
                    .runOnJS(true)}>
                  <View
                    className="rounded-md px-8 py-4 shadow-sm shadow-black/5"
                    style={{ backgroundColor: colors.accent }}>
                    <Text className="text-base font-semibold text-white">Create Habit</Text>
                  </View>
                </GestureDetector>
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const PlannerRow = ({
  habit,
  index,
  onPress,
}: {
  habit: Habit;
  index: number;
  onPress: () => void;
}) => {
  const pressed = useSharedValue(0);

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
          <View className="gap-1 rounded-xl bg-card p-4 shadow-sm shadow-black/5">
            <Text className="text-xl font-semibold">{habit.name}</Text>
            <View className="flex-row gap-4">
              <Text className="text-sm text-muted-foreground">
                {habit.segments.length} {habit.segments.length === 1 ? 'segment' : 'segments'}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {formatDuration(totalDuration(habit.segments))}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {formatScheduledDays(habit.scheduledDays)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};
