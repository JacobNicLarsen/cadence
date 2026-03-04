import { useCallback, useEffect, useState } from 'react';
import type { Habit } from '@/types/habit';
import { getHabits } from '@/storage/habit-storage';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getHabits();
    setHabits(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { habits, loading, refresh };
};
