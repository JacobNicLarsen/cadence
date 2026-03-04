export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type Segment = {
  id: string;
  name: string;
  durationSeconds: number;
  type: 'activity' | 'pause';
};

export type Habit = {
  id: string;
  name: string;
  segments: Segment[];
  scheduledDays: DayOfWeek[];
  createdAt: number;
  updatedAt: number;
};

export type SessionRecord = {
  id: string;
  habitId: string;
  habitName: string;
  completedAt: number;
  totalDurationSeconds: number;
  segmentsCompleted: number;
};
