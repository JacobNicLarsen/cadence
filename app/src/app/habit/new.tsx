import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/colors';
import { saveHabit } from '@/storage/habit-storage';
import type { DayOfWeek, Segment } from '@/types/habit';
import { formatDuration } from '@/utils/format';
import { generateId } from '@/utils/id';

const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const STEPS = ['Name', 'Schedule', 'Segments'] as const;
const MIN_SECONDS = 5;
const MAX_SECONDS = 3600;

export default function NewHabitScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [scheduledDays, setScheduledDays] = useState<DayOfWeek[]>(ALL_DAYS);
  const [segments, setSegments] = useState<Segment[]>([
    { id: generateId(), name: '', durationSeconds: 60, type: 'activity' },
  ]);

  const nameInputRef = useRef<TextInput>(null);

  const handleSave = async () => {
    const hasNamedSegment = segments.some((s) => s.name.trim().length > 0);
    if (!hasNamedSegment) {
      Alert.alert('Name your segments', 'Give at least one segment a name before saving.');
      return;
    }
    const now = Date.now();
    await saveHabit({
      id: generateId(),
      name: name.trim(),
      segments,
      scheduledDays,
      createdAt: now,
      updatedAt: now,
    });
    router.back();
  };

  const canAdvance = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return scheduledDays.length > 0;
    return true;
  };

  const handleNext = () => {
    Keyboard.dismiss();
    if (!canAdvance()) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container} className="bg-background">
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={10}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
              <SymbolView
                name={step === 0 ? 'xmark' : 'chevron.left'}
                size={18}
                tintColor={colors.foreground}
              />
            </Pressable>
            <ProgressDots current={step} total={STEPS.length} colors={colors} />
            <View style={styles.backButton} />
          </View>

          {/* Step content */}
          <View style={styles.content}>
            {step === 0 ? (
              <StepName
                name={name}
                onNameChange={setName}
                inputRef={nameInputRef}
                colors={colors}
                onSubmit={handleNext}
              />
            ) : step === 1 ? (
              <StepSchedule
                scheduledDays={scheduledDays}
                onScheduledDaysChange={setScheduledDays}
                colors={colors}
              />
            ) : (
              <StepSegments
                segments={segments}
                onSegmentsChange={setSegments}
                colors={colors}
              />
            )}
          </View>

          {/* Bottom action */}
          <View style={styles.bottomBar}>
            <ActionButton
              label={step === STEPS.length - 1 ? 'Create Habit' : 'Continue'}
              enabled={canAdvance()}
              onPress={handleNext}
              colors={colors}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* ── Progress Dots ── */

const ProgressDots = ({
  current,
  total,
  colors,
}: {
  current: number;
  total: number;
  colors: ReturnType<typeof useThemeColors>;
}) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          {
            backgroundColor: i <= current ? colors.accent : colors.border,
            width: i === current ? 24 : 8,
          },
        ]}
      />
    ))}
  </View>
);

/* ── Step 1: Name ── */

const StepName = ({
  name,
  onNameChange,
  inputRef,
  colors,
  onSubmit,
}: {
  name: string;
  onNameChange: (n: string) => void;
  inputRef: React.RefObject<TextInput | null>;
  colors: ReturnType<typeof useThemeColors>;
  onSubmit: () => void;
}) => (
  <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContainer}>
    <View style={styles.stepHeader}>
      <Text style={[styles.stepTitle, { fontFamily: 'ui-rounded' }]}>
        What habit are you building?
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
        Keep it short and specific
      </Text>
    </View>
    <View
      style={[
        styles.nameInputContainer,
        {
          borderColor: name.trim().length > 0 ? colors.accent : colors.border,
          backgroundColor: colors.card,
        },
      ]}>
      <TextInput
        ref={inputRef}
        value={name}
        onChangeText={onNameChange}
        placeholder="e.g. Morning Yoga"
        placeholderTextColor={colors.mutedForeground + '80'}
        style={[styles.nameInput, { color: colors.foreground }]}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={onSubmit}
        maxLength={50}
      />
      {name.trim().length > 0 ? (
        <Animated.View entering={FadeIn.duration(200)}>
          <SymbolView name="checkmark.circle.fill" size={22} tintColor={colors.accent} />
        </Animated.View>
      ) : null}
    </View>
    <View style={styles.suggestions}>
      {['Morning Routine', 'Focus Session', 'Workout', 'Meditation'].map((suggestion) => (
        <Pressable key={suggestion} onPress={() => onNameChange(suggestion)}>
          <View style={[styles.suggestionChip, { backgroundColor: colors.accent + '12' }]}>
            <Text style={[styles.suggestionText, { color: colors.accent }]}>
              {suggestion}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  </Animated.View>
);

/* ── Step 2: Schedule ── */

const DAYS: { key: DayOfWeek; label: string; full: string }[] = [
  { key: 'mon', label: 'M', full: 'Mon' },
  { key: 'tue', label: 'T', full: 'Tue' },
  { key: 'wed', label: 'W', full: 'Wed' },
  { key: 'thu', label: 'T', full: 'Thu' },
  { key: 'fri', label: 'F', full: 'Fri' },
  { key: 'sat', label: 'S', full: 'Sat' },
  { key: 'sun', label: 'S', full: 'Sun' },
];

const PRESETS: { label: string; days: DayOfWeek[] }[] = [
  { label: 'Every day', days: ALL_DAYS },
  { label: 'Weekdays', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
  { label: 'Weekends', days: ['sat', 'sun'] },
];

const StepSchedule = ({
  scheduledDays,
  onScheduledDaysChange,
  colors,
}: {
  scheduledDays: DayOfWeek[];
  onScheduledDaysChange: (days: DayOfWeek[]) => void;
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const toggleDay = (day: DayOfWeek) => {
    if (scheduledDays.includes(day)) {
      if (scheduledDays.length <= 1) return;
      onScheduledDaysChange(scheduledDays.filter((d) => d !== day));
    } else {
      onScheduledDaysChange([...scheduledDays, day]);
    }
  };

  const applyPreset = (days: DayOfWeek[]) => {
    onScheduledDaysChange(days);
  };

  const isPresetActive = (days: DayOfWeek[]) =>
    days.length === scheduledDays.length && days.every((d) => scheduledDays.includes(d));

  return (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { fontFamily: 'ui-rounded' }]}>
          When do you practice?
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
          Pick the days that work for you
        </Text>
      </View>

      {/* Quick presets */}
      <View style={styles.presetsRow}>
        {PRESETS.map((preset) => {
          const active = isPresetActive(preset.days);
          return (
            <Pressable key={preset.label} onPress={() => applyPreset(preset.days)}>
              <View
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: active ? colors.accent : 'transparent',
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.presetText,
                    { color: active ? '#ffffff' : colors.mutedForeground },
                  ]}>
                  {preset.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Day circles */}
      <View style={styles.daysRow}>
        {DAYS.map(({ key, label, full }) => {
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
              <Text
                style={[
                  styles.dayFullLabel,
                  { color: selected ? colors.accent : colors.mutedForeground },
                ]}>
                {full}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

/* ── Step 3: Segments ── */

const StepSegments = ({
  segments,
  onSegmentsChange,
  colors,
}: {
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
  colors: ReturnType<typeof useThemeColors>;
}) => {
  const addSegment = (type: 'activity' | 'pause') => {
    onSegmentsChange([
      ...segments,
      {
        id: generateId(),
        name: '',
        durationSeconds: type === 'activity' ? 60 : 30,
        type,
      },
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

  return (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { fontFamily: 'ui-rounded' }]}>
          Build your flow
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
          Add activity and rest segments
        </Text>
      </View>

      <ScrollView
        style={styles.segmentsList}
        contentContainerStyle={styles.segmentsContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {segments.map((segment, index) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            index={index}
            total={segments.length}
            onUpdate={(updates) => updateSegment(index, updates)}
            onDelete={() => deleteSegment(index)}
            onToggleType={() => toggleType(index)}
            colors={colors}
          />
        ))}

        {/* Add segment buttons */}
        <View style={styles.addButtons}>
          <Pressable onPress={() => addSegment('activity')} style={styles.addButtonFlex}>
            <View style={[styles.addSegmentButton, { borderColor: colors.activity + '40' }]}>
              <SymbolView name="plus" size={14} tintColor={colors.activity} />
              <Text style={[styles.addSegmentText, { color: colors.activity }]}>
                Activity
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => addSegment('pause')} style={styles.addButtonFlex}>
            <View style={[styles.addSegmentButton, { borderColor: colors.pause + '40' }]}>
              <SymbolView name="plus" size={14} tintColor={colors.pause} />
              <Text style={[styles.addSegmentText, { color: colors.pause }]}>
                Rest
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

/* ── Segment Card ── */

const SegmentCard = ({
  segment,
  index,
  total,
  onUpdate,
  onDelete,
  onToggleType,
  colors,
}: {
  segment: Segment;
  index: number;
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
    <Animated.View entering={FadeInDown.delay(index * 80).duration(300)}>
      <View style={[styles.segmentCard, { backgroundColor: accentColor + '08' }]}>
        {/* Color accent bar */}
        <View style={[styles.segmentAccent, { backgroundColor: accentColor }]} />

        <View style={styles.segmentContent}>
          {/* Top: type toggle + delete */}
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
                <View style={styles.deleteButton}>
                  <SymbolView name="trash" size={14} tintColor={colors.destructive} />
                </View>
              </Pressable>
            ) : null}
          </View>

          {/* Name input */}
          <View
            style={[
              styles.segmentNameContainer,
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
                color={colors}
              />
              <View style={[styles.durationDisplay, { backgroundColor: colors.card }]}>
                <Text style={[styles.durationText, { color: colors.foreground }]}>
                  {formatDuration(segment.durationSeconds)}
                </Text>
              </View>
              <StepperButton
                icon="plus"
                onPress={() => onUpdate({ durationSeconds: clamp(segment.durationSeconds + 15) })}
                color={colors}
              />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

/* ── Stepper Button ── */

const StepperButton = ({
  icon,
  onPress,
  color,
}: {
  icon: 'minus' | 'plus';
  onPress: () => void;
  color: ReturnType<typeof useThemeColors>;
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
        style={[animatedStyle, styles.stepperBtn, { backgroundColor: color.card }]}>
        <SymbolView name={icon} size={12} tintColor={color.mutedForeground} />
      </Animated.View>
    </Pressable>
  );
};

/* ── Action Button ── */

const ActionButton = ({
  label,
  enabled,
  onPress,
  colors,
}: {
  label: string;
  enabled: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
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
      <Animated.View
        style={[
          animatedStyle,
          styles.actionButton,
          { backgroundColor: enabled ? colors.accent : colors.muted },
        ]}>
        <Text
          style={[
            styles.actionButtonText,
            { color: enabled ? '#ffffff' : colors.mutedForeground },
          ]}>
          {label}
        </Text>
        {enabled ? (
          <SymbolView
            name="arrow.right"
            size={16}
            tintColor="#ffffff"
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

/* ── Styles ── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepHeader: {
    gap: 6,
    marginBottom: 28,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 16,
  },

  // Step 1: Name
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Step 2: Schedule
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  dayFullLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },

  // Step 3: Segments
  segmentsList: {
    flex: 1,
  },
  segmentsContent: {
    gap: 12,
    paddingBottom: 20,
  },
  addButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  addButtonFlex: {
    flex: 1,
  },
  addSegmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addSegmentText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Segment Card
  segmentCard: {
    borderRadius: 16,
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
  deleteButton: {
    padding: 6,
  },
  segmentNameContainer: {
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

  // Action button
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
