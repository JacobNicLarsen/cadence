import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import type { Habit } from '@/types/habit';
import { formatDuration, totalDuration } from '@/utils/format';

type HabitCardProps = {
  habit: Habit;
  onPress: () => void;
  onEdit?: () => void;
  index?: number;
};

export const HabitCard = ({ habit, onPress, onEdit, index = 0 }: HabitCardProps) => {
  const colors = useThemeColors();
  const duration = totalDuration(habit.segments);
  const segmentCount = habit.segments.length;
  const pressed = useSharedValue(0);

  const activityCount = habit.segments.filter((s) => s.type === 'activity').length;
  const isActivityHeavy = activityCount >= habit.segments.length / 2;
  const accentColor = isActivityHeavy ? colors.activity : colors.pause;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(300).springify()}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, { damping: 15, stiffness: 200 });
        }}
        accessibilityLabel={`Start ${habit.name}, ${formatDuration(duration)}`}
        accessibilityRole="button">
        <Animated.View style={animatedStyle}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {/* Accent stripe */}
            <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />

            <View style={styles.cardContent}>
              {/* Top row: name + edit */}
              <View style={styles.topRow}>
                <Text
                  style={[styles.name, { color: colors.foreground }]}
                  numberOfLines={1}>
                  {habit.name}
                </Text>
                {onEdit ? (
                  <Pressable
                    onPress={onEdit}
                    hitSlop={12}
                    style={styles.editButton}
                    accessibilityLabel={`Edit ${habit.name}`}
                    accessibilityRole="button">
                    <SymbolView name="ellipsis" size={16} tintColor={colors.mutedForeground} />
                  </Pressable>
                ) : null}
              </View>

              {/* Meta row */}
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <SymbolView name="clock" size={12} tintColor={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {formatDuration(duration)}
                  </Text>
                </View>
                <View style={styles.metaPill}>
                  <SymbolView name="square.stack" size={12} tintColor={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {segmentCount} {segmentCount === 1 ? 'segment' : 'segments'}
                  </Text>
                </View>
              </View>

              {/* Play button */}
              <View style={styles.bottomRow}>
                <View style={[styles.playChip, { backgroundColor: accentColor + '15' }]}>
                  <SymbolView name="play.fill" size={11} tintColor={accentColor} />
                  <Text style={[styles.playText, { color: accentColor }]}>
                    Start
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentStripe: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
  },
  editButton: {
    padding: 4,
    marginRight: -4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
  },
  playChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  playText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
