/* eslint-disable import/prefer-default-export */
import { RecurrencePattern } from '../types';

/**
 * Calculates the next wake time for a recurring snooze pattern.
 * Returns a timestamp in ms, or null if no more occurrences.
 */
export function calculateNextWakeTime(
  recurrencePattern: RecurrencePattern,
  afterDate?: Date
): number | null {
  const now = afterDate || new Date();
  const [hours, minutes] = recurrencePattern.time.split(':').map(Number);

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
      nextWakeTime.setDate(nextWakeTime.getDate() + 1);
      while (nextWakeTime.getDay() === 0 || nextWakeTime.getDay() === 6) {
        nextWakeTime.setDate(nextWakeTime.getDate() + 1);
      }
      break;
    }
    case 'weekly':
    case 'custom': {
      if (
        !recurrencePattern.daysOfWeek ||
        recurrencePattern.daysOfWeek.length === 0
      ) {
        return null;
      }
      const currentDay = now.getDay();
      const sortedDays = [...recurrencePattern.daysOfWeek].sort(
        (a, b) => a - b
      );
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
