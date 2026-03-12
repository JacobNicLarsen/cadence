import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';

import { DaySelector } from '@/components/day-selector';
import { DurationInput } from '@/components/duration-input';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import type { DayOfWeek, Segment } from '@/types/habit';
import { generateId } from '@/utils/id';

type HabitFormProps = {
  name: string;
  onNameChange: (name: string) => void;
  scheduledDays: DayOfWeek[];
  onScheduledDaysChange: (days: DayOfWeek[]) => void;
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
  onSave: () => void;
  onDelete?: () => void;
  isEdit: boolean;
};

export const HabitForm = ({
  name,
  onNameChange,
  scheduledDays,
  onScheduledDaysChange,
  segments,
  onSegmentsChange,
  onSave,
  onDelete,
  isEdit,
}: HabitFormProps) => {
  const colors = useThemeColors();

  const addSegment = () => {
    onSegmentsChange([
      ...segments,
      { id: generateId(), name: '', durationSeconds: 30, type: 'activity' },
    ]);
  };

  const updateSegment = (index: number, updates: Partial<Segment>) => {
    const updated = segments.map((s, i) => (i === index ? { ...s, ...updates } : s));
    onSegmentsChange(updated);
  };

  const deleteSegment = (index: number) => {
    if (segments.length <= 1) return;
    onSegmentsChange(segments.filter((_, i) => i !== index));
  };

  const toggleType = (index: number) => {
    const current = segments[index].type;
    updateSegment(index, { type: current === 'activity' ? 'pause' : 'activity' });
  };

  const [attempted, setAttempted] = useState(false);

  const missingName = name.trim().length === 0;
  const missingSegmentName = !segments.some((s) => s.name.trim().length > 0);
  const canSave = !missingName && !missingSegmentName;

  const handleSavePress = () => {
    if (!canSave) {
      setAttempted(true);
      return;
    }
    onSave();
  };

  const handleDelete = () => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-6 p-6 pb-16" keyboardShouldPersistTaps="handled">
      <View className="gap-2">
        <Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Habit Name
        </Text>
        <FocusableInput
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g. Morning Routine"
        />
      </View>

      <View className="gap-2">
        <Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Schedule
        </Text>
        <DaySelector selected={scheduledDays} onChange={onScheduledDaysChange} />
      </View>

      <View className="gap-2">
        <Text className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Segments
        </Text>
        {segments.map((segment, index) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            index={index}
            total={segments.length}
            onUpdate={(updates) => updateSegment(index, updates)}
            onDelete={() => deleteSegment(index)}
            onToggleType={() => toggleType(index)}
          />
        ))}
        <GestureDetector gesture={Gesture.Tap().onEnd(addSegment).runOnJS(true)}>
          <View className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4">
            <SymbolView name="plus" size={16} tintColor={colors.mutedForeground} />
            <Text className="text-sm text-muted-foreground">Add Segment</Text>
          </View>
        </GestureDetector>
      </View>

      <View className="gap-2">
        <SpringButton
          onPress={handleSavePress}
          bgColor={canSave ? colors.accent : colors.muted}>
          <Text
            className="text-base font-semibold"
            style={{ color: canSave ? '#ffffff' : colors.mutedForeground }}>
            {isEdit ? 'Save Changes' : 'Create Habit'}
          </Text>
        </SpringButton>
        {attempted && !canSave ? (
          <View className="gap-1">
            {missingName ? (
              <Text className="text-center text-sm text-destructive">
                Give your habit a name
              </Text>
            ) : null}
            {missingSegmentName ? (
              <Text className="text-center text-sm text-destructive">
                Name at least one segment
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {isEdit && onDelete ? (
        <SpringButton onPress={handleDelete} bgColor="transparent">
          <Text className="text-sm text-destructive">Delete Habit</Text>
        </SpringButton>
      ) : null}
    </ScrollView>
  );
};

const FocusableInput = ({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) => {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="rounded-md border p-4 text-base text-foreground"
      style={{
        borderColor: focused ? colors.ring : colors.border,
      }}
    />
  );
};

const SegmentCard = ({
  segment,
  index,
  total,
  onUpdate,
  onDelete,
  onToggleType,
}: {
  segment: Segment;
  index: number;
  total: number;
  onUpdate: (updates: Partial<Segment>) => void;
  onDelete: () => void;
  onToggleType: () => void;
}) => {
  const colors = useThemeColors();
  const isActivity = segment.type === 'activity';
  const sliderPos = useSharedValue(isActivity ? 0 : 1);

  const handleToggle = () => {
    sliderPos.value = withTiming(isActivity ? 1 : 0, { duration: 200 });
    onToggleType();
  };

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderPos.value * 80 }],
  }));

  return (
    <View className="gap-2 rounded-xl bg-card p-4 shadow-sm shadow-black/5">
      <View className="flex-row items-center gap-2">
        <TextInput
          value={segment.name}
          onChangeText={(text) => onUpdate({ name: text })}
          placeholder="Segment name"
          placeholderTextColor={colors.mutedForeground}
          className="flex-1 text-base font-semibold text-foreground"
        />
        {total > 1 ? (
          <GestureDetector gesture={Gesture.Tap().onEnd(onDelete).runOnJS(true)}>
            <View className="p-1" hitSlop={8}>
              <SymbolView name="xmark" size={12} tintColor={colors.mutedForeground} />
            </View>
          </GestureDetector>
        ) : null}
      </View>
      <View className="flex-row items-center justify-between">
        <GestureDetector gesture={Gesture.Tap().onEnd(handleToggle).runOnJS(true)}>
          <View
            className="relative h-9 w-40 flex-row overflow-hidden rounded-md"
            style={{ backgroundColor: colors.muted }}>
            <Animated.View
              className="absolute h-9 w-20 rounded-md"
              style={[
                { backgroundColor: isActivity ? colors.accent : colors.pause },
                sliderStyle,
              ]}
            />
            <Text
              className="z-10 flex-1 text-center text-sm leading-9"
              style={{ color: isActivity ? '#ffffff' : colors.foreground }}>
              Activity
            </Text>
            <Text
              className="z-10 flex-1 text-center text-sm leading-9"
              style={{ color: isActivity ? colors.foreground : '#ffffff' }}>
              Pause
            </Text>
          </View>
        </GestureDetector>
        <DurationInput
          value={segment.durationSeconds}
          onChange={(seconds) => onUpdate({ durationSeconds: seconds })}
        />
      </View>
    </View>
  );
};

const SpringButton = ({
  onPress,
  bgColor,
  children,
}: {
  onPress: () => void;
  bgColor: string;
  children: React.ReactNode;
}) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
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
        style={[animatedStyle, { backgroundColor: bgColor }]}
        className="items-center rounded-md py-4 shadow-sm shadow-black/5">
        {children}
      </Animated.View>
    </Pressable>
  );
};
