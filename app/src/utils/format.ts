import type { DayOfWeek, Segment } from '@/types/habit';

export const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
};

export const totalDuration = (segments: Segment[]): number =>
  segments.reduce((sum, s) => sum + s.durationSeconds, 0);

const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const ALL_DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const formatScheduledDays = (days: DayOfWeek[]): string => {
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) {
    return 'Weekdays';
  }
  if (days.length === 2 && days.includes('sat') && days.includes('sun')) {
    return 'Weekends';
  }
  return days
    .sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b))
    .map((d) => DAY_LABELS[d])
    .join(', ');
};

export const formatTimer = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
