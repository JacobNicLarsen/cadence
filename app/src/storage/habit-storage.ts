import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Habit } from '@/types/habit';

const STORAGE_KEY = '@cadence/habits';

export const getHabits = async (): Promise<Habit[]> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  const habits: Habit[] = JSON.parse(json);
  return habits.sort((a, b) => b.createdAt - a.createdAt);
};

export const getHabit = async (id: string): Promise<Habit | null> => {
  const habits = await getHabits();
  return habits.find((h) => h.id === id) ?? null;
};

export const saveHabit = async (habit: Habit): Promise<void> => {
  const habits = await getHabits();
  const index = habits.findIndex((h) => h.id === habit.id);
  if (index >= 0) {
    habits[index] = habit;
  } else {
    habits.push(habit);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

export const deleteHabit = async (id: string): Promise<void> => {
  const habits = await getHabits();
  const filtered = habits.filter((h) => h.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
