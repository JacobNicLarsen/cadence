import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { HabitForm } from '@/components/habit-form';
import { useHabit } from '@/hooks/use-habit';
import { deleteHabit, saveHabit } from '@/storage/habit-storage';
import type { DayOfWeek, Segment } from '@/types/habit';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habit, loading } = useHabit(id);

  const [name, setName] = useState('');
  const [scheduledDays, setScheduledDays] = useState<DayOfWeek[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (habit && !initialized) {
      setName(habit.name);
      setScheduledDays(habit.scheduledDays);
      setSegments(habit.segments);
      setInitialized(true);
    }
  }, [habit, initialized]);

  const handleSave = async () => {
    if (!habit) return;
    await saveHabit({
      ...habit,
      name: name.trim(),
      segments,
      scheduledDays,
      updatedAt: Date.now(),
    });
    router.back();
  };

  const handleDelete = async () => {
    if (!habit) return;
    await deleteHabit(habit.id);
    router.back();
  };

  if (loading || !initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <HabitForm
        name={name}
        onNameChange={setName}
        scheduledDays={scheduledDays}
        onScheduledDaysChange={setScheduledDays}
        segments={segments}
        onSegmentsChange={setSegments}
        onSave={handleSave}
        onDelete={handleDelete}
        isEdit
      />
    </View>
  );
}
