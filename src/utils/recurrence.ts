/* eslint-disable import/prefer-default-export */
import { RecurrencePattern } from '../types';
import { getSnoozrSettings, SnoozrSettings } from './settings';

/**
 * Calculates the next wake time for a recurring snooze pattern.
 * Returns a timestamp in ms, or null if no more occurrences.
 * Accepts optional user settings for startOfDay, startOfWeek, startOfWeekend.
 */
export async function calculateNextWakeTime(
  recurrencePattern: RecurrencePattern,
  afterDate?: Date,
  settings?: SnoozrSettings
): Promise<number | null> {
  const userSettings = settings || (await getSnoozrSettings());
  const now = afterDate || new Date();
  const [hours, minutes] = (
    recurrencePattern.time ||
    `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  )
    .split(':')
    .map(Number);

  // Check if we've reached the end date
  if (recurrencePattern.endDate && now.getTime() >= recurrencePattern.endDate) {
    return null; // No more occurrences
  }

  // Set nextWakeTime to the afterDate (or now) as the base date
  const nextWakeTime = new Date(now.getTime());
  nextWakeTime.setHours(hours, minutes, 0, 0);

  switch (recurrencePattern.type) {
    case 'daily':
      if (nextWakeTime.getTime() <= now.getTime()) {
        nextWakeTime.setDate(nextWakeTime.getDate() + 1);
      }
      break;
    case 'weekdays': {
      // Use userSettings to determine which days are considered weekdays
      // Default: [1,2,3,4,5] (Monday-Friday), but allow user to customize if desired
      const weekdays = [0, 1, 2, 3, 4, 5, 6].filter(
        (d) =>
          d !== userSettings.startOfWeekend &&
          d !== (userSettings.startOfWeekend + 1) % 7
      );
      nextWakeTime.setDate(nextWakeTime.getDate() + 1);
      while (!weekdays.includes(nextWakeTime.getDay())) {
        nextWakeTime.setDate(nextWakeTime.getDate() + 1);
      }
      break;
    }
    case 'weekly':
    case 'custom': {
      const daysOfWeek =
        recurrencePattern.daysOfWeek && recurrencePattern.daysOfWeek.length > 0
          ? recurrencePattern.daysOfWeek
          : [now.getDay()]; // Fallback to current weekday only if not set
      const currentDay = now.getDay();
      const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
      if (
        sortedDays.includes(currentDay) &&
        nextWakeTime.getTime() > now.getTime()
      ) {
        // Use today
      } else {
        const nextDayIndex = sortedDays.findIndex((day) => day > currentDay);
        if (nextDayIndex !== -1) {
          const daysToAdd = sortedDays[nextDayIndex] - currentDay;
          nextWakeTime.setDate(now.getDate() + daysToAdd);
        } else {
          const daysToAdd = 7 - currentDay + sortedDays[0];
          nextWakeTime.setDate(now.getDate() + daysToAdd);
        }
      }
      break;
    }
    case 'monthly': {
      nextWakeTime.setDate(recurrencePattern.dayOfMonth || 1);
      if (nextWakeTime.getTime() <= now.getTime()) {
        nextWakeTime.setMonth(nextWakeTime.getMonth() + 1);
      }
      break;
    }
    default:
      return null;
  }
  return nextWakeTime.getTime();
}
