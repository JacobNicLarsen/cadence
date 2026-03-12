import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionRecord } from '@/types/habit';

const STORAGE_KEY = '@cadence/sessions';

export const getSessionRecords = async (): Promise<SessionRecord[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json) as SessionRecord[];
  } catch {
    return [];
  }
};

export const saveSessionRecord = async (
  record: SessionRecord,
): Promise<void> => {
  const records = await getSessionRecords();
  records.push(record);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};
