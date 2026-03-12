import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import type { DayOfWeek, Segment } from '@/types/habit';
import { formatDuration } from '@/utils/format';
import { generateId } from '@/utils/id';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

const MIN_SECONDS = 5;
const MAX_SECONDS = 3600;

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
      { id: generateId(), name: '', durationSeconds: 60, type: 'activity' },
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

  const toggleDay = (day: DayOfWeek) => {
    if (scheduledDays.includes(day)) {
      if (scheduledDays.length <= 1) return;
      onScheduledDaysChange(scheduledDays.filter((d) => d !== day));
    } else {
      onScheduledDaysChange([...scheduledDays, day]);
    }
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {/* Name */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Habit Name
        </Text>
        <View
          style={[
            styles.nameInput,
            {
              borderColor: name.trim() ? colors.accent : colors.border,
              backgroundColor: colors.card,
            },
          ]}>
          <TextInput
            value={name}
            onChangeText={onNameChange}
            placeholder="e.g. Morning Routine"
            placeholderTextColor={colors.mutedForeground + '80'}
            style={[styles.nameInputText, { color: colors.foreground }]}
            maxLength={50}
          />
          {name.trim().length > 0 ? (
            <SymbolView name="checkmark.circle.fill" size={20} tintColor={colors.accent} />
          ) : null}
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Schedule
        </Text>
        <View style={styles.daysRow}>
          {DAYS.map(({ key, label }) => {
            const selected = scheduledDays.includes(key);
            return (
              <Pressable key={key} onPress={() => toggleDay(key)}>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: selected ? colors.accent : 'transparent',
                      borderColor: selected ? colors.accent : colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: selected ? '#ffffff' : colors.mutedForeground },
                    ]}>
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Segments */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Segments
        </Text>
        <View style={styles.segmentsGap}>
          {segments.map((segment, index) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              total={segments.length}
              onUpdate={(updates) => updateSegment(index, updates)}
              onDelete={() => deleteSegment(index)}
              onToggleType={() => toggleType(index)}
              colors={colors}
            />
          ))}
          <Pressable onPress={addSegment}>
            <View style={[styles.addButton, { borderColor: colors.border }]}>
              <SymbolView name="plus" size={14} tintColor={colors.mutedForeground} />
              <Text style={[styles.addButtonText, { color: colors.mutedForeground }]}>
                Add Segment
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Save */}
      <View style={styles.actions}>
        <ActionButton
          label={isEdit ? 'Save Changes' : 'Create Habit'}
          enabled={canSave}
          onPress={handleSavePress}
          bgColor={canSave ? colors.accent : colors.muted}
          textColor={canSave ? '#ffffff' : colors.mutedForeground}
        />
        {attempted && !canSave ? (
          <View style={styles.errorGroup}>
            {missingName ? (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                Give your habit a name
              </Text>
            ) : null}
            {missingSegmentName ? (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                Name at least one segment
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Delete */}
      {isEdit && onDelete ? (
        <Pressable onPress={handleDelete} style={styles.deleteRow}>
          <SymbolView name="trash" size={14} tintColor={colors.destructive} />
          <Text style={[styles.deleteText, { color: colors.destructive }]}>
            Delete Habit
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
};

/* ── Segment Card ── */

const SegmentCard = ({
  segment,
  total,
  onUpdate,
  onDelete,
  onToggleType,
  colors,
}: {
  segment: Segment;
  total: number;
  onUpdate: (updates: Partial<Segment>) => void;
  onDelete: () => void;
  onToggleType: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const isActivity = segment.type === 'activity';
  const accentColor = isActivity ? colors.activity : colors.pause;
  const sliderPos = useSharedValue(isActivity ? 0 : 1);

  const handleToggle = () => {
    sliderPos.value = withTiming(isActivity ? 1 : 0, { duration: 250 });
    onToggleType();
  };

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderPos.value * 72 }],
  }));

  const clamp = (v: number) => Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, v));

  return (
    <View style={[styles.segmentCard, { backgroundColor: accentColor + '08' }]}>
      <View style={[styles.segmentAccent, { backgroundColor: accentColor }]} />
      <View style={styles.segmentContent}>
        {/* Type toggle + delete */}
        <View style={styles.segmentTopRow}>
          <Pressable onPress={handleToggle}>
            <View style={[styles.typeToggle, { backgroundColor: colors.card }]}>
              <Animated.View
                style={[
                  styles.typeSlider,
                  { backgroundColor: accentColor },
                  sliderStyle,
                ]}
              />
              <Text
                style={[
                  styles.typeLabel,
                  { color: isActivity ? '#ffffff' : colors.foreground, zIndex: 1 },
                ]}>
                Activity
              </Text>
              <Text
                style={[
                  styles.typeLabel,
                  { color: isActivity ? colors.foreground : '#ffffff', zIndex: 1 },
                ]}>
                Rest
              </Text>
            </View>
          </Pressable>
          {total > 1 ? (
            <Pressable onPress={onDelete} hitSlop={12}>
              <View style={styles.segmentDeleteBtn}>
                <SymbolView name="trash" size={14} tintColor={colors.destructive} />
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* Name */}
        <View
          style={[
            styles.segmentNameRow,
            {
              borderColor: segment.name.trim() ? accentColor + '50' : colors.border,
              backgroundColor: colors.card,
            },
          ]}>
          <SymbolView
            name={isActivity ? 'bolt.fill' : 'leaf.fill'}
            size={16}
            tintColor={accentColor}
          />
          <TextInput
            value={segment.name}
            onChangeText={(text) => onUpdate({ name: text })}
            placeholder={isActivity ? 'e.g. Work sprint' : 'e.g. Deep breaths'}
            placeholderTextColor={colors.mutedForeground + '60'}
            style={[styles.segmentNameInput, { color: colors.foreground }]}
            maxLength={40}
          />
        </View>

        {/* Duration */}
        <View style={styles.durationRow}>
          <SymbolView name="clock" size={14} tintColor={colors.mutedForeground} />
          <Text style={[styles.durationLabel, { color: colors.mutedForeground }]}>
            Duration
          </Text>
          <View style={styles.durationControls}>
            <StepperButton
              icon="minus"
              onPress={() => onUpdate({ durationSeconds: clamp(segment.durationSeconds - 15) })}
              colors={colors}
            />
            <View style={[styles.durationDisplay, { backgroundColor: colors.card }]}>
              <Text style={[styles.durationText, { color: colors.foreground }]}>
                {formatDuration(segment.durationSeconds)}
              </Text>
            </View>
            <StepperButton
              icon="plus"
              onPress={() => onUpdate({ durationSeconds: clamp(segment.durationSeconds + 15) })}
              colors={colors}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

/* ── Stepper Button ── */

const StepperButton = ({
  icon,
  onPress,
  colors,
}: {
  icon: 'minus' | 'plus';
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.85]) }],
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
      <Animated.View
        style={[animatedStyle, styles.stepperBtn, { backgroundColor: colors.muted }]}>
        <SymbolView name={icon} size={12} tintColor={colors.mutedForeground} />
      </Animated.View>
    </Pressable>
  );
};

/* ── Action Button ── */

const ActionButton = ({
  label,
  enabled,
  onPress,
  bgColor,
  textColor,
}: {
  label: string;
  enabled: boolean;
  onPress: () => void;
  bgColor: string;
  textColor: string;
}) => {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
  }));

  return (
    <Pressable
      onPress={enabled ? onPress : undefined}
      onPressIn={() => {
        if (!enabled) return;
        pressed.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, { damping: 12, stiffness: 200 });
      }}>
      <Animated.View style={[animatedStyle, styles.saveButton, { backgroundColor: bgColor }]}>
        <Text style={[styles.saveButtonText, { color: textColor }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

/* ── Styles ── */

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    gap: 28,
  },

  // Field groups
  fieldGroup: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Name input
  nameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  nameInputText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
  },

  // Days
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Segments
  segmentsGap: {
    gap: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Segment card
  segmentCard: {
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segmentAccent: {
    width: 4,
  },
  segmentContent: {
    flex: 1,
    padding: 14,
    gap: 12,
  },
  segmentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeToggle: {
    flexDirection: 'row',
    width: 144,
    height: 34,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  typeSlider: {
    position: 'absolute',
    width: 72,
    height: 34,
    borderRadius: 10,
  },
  typeLabel: {
    flex: 1,
    textAlign: 'center',
    lineHeight: 34,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentDeleteBtn: {
    padding: 6,
  },
  segmentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  segmentNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 'auto',
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationDisplay: {
    minWidth: 60,
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  durationText: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Actions
  actions: {
    gap: 8,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  errorGroup: {
    gap: 4,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
