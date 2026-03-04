import { useEffect, useState } from 'react';
import type { Habit } from '@/types/habit';
import { getHabit } from '@/storage/habit-storage';

export const useHabit = (id: string) => {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getHabit(id);
      setHabit(data);
      setLoading(false);
    };
    load();
  }, [id]);

  return { habit, loading };
};
