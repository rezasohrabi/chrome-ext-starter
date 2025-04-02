import { type ComponentType } from 'react';

export interface SnoozeOption {
  id: string;
  label: string;
  hours?: number;
  days?: number;
  custom?: boolean;
  calculateTime?: () => number;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number; // 1-31
  time: string; // HH:MM format
  endDate?: number; // Optional timestamp when recurrence ends
}

export interface SnoozedTab {
  id: number;
  url?: string;
  title?: string;
  favicon?: string;
  createdAt: number;
  wakeTime: number;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}
