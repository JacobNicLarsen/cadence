import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { HabitForm } from '@/components/habit-form';
import { saveHabit } from '@/storage/habit-storage';
import type { DayOfWeek, Segment } from '@/types/habit';
import { generateId } from '@/utils/id';

const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function NewHabitScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [scheduledDays, setScheduledDays] = useState<DayOfWeek[]>(ALL_DAYS);
  const [segments, setSegments] = useState<Segment[]>([
    { id: generateId(), name: '', durationSeconds: 30, type: 'activity' },
  ]);

  const handleSave = async () => {
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
        isEdit={false}
      />
    </View>
  );
}
