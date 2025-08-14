import React from 'react';

import { RecurrencePattern } from '../types';
import {
  computeWeekdayIndices,
  orderedWeekdayIndices,
} from '../utils/datetime';
import { SnoozrSettings } from '../utils/settings';

type RecurrenceFieldsProps = {
  recurrenceType: RecurrencePattern['type'];
  setRecurrenceType: (type: RecurrencePattern['type']) => void;
  time: string;
  setTime: (time: string) => void;
  selectedDays: number[];
  toggleDay: (day: number) => void;
  dayOfMonth: number;
  setDayOfMonth: (day: number) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  settings: SnoozrSettings;
  ids: {
    patternId: string;
    timeId: string;
    daysOfWeekId: string;
    dayOfMonthId: string;
    endDateId: string;
  };
};

function RecurrenceFields({
  recurrenceType,
  setRecurrenceType,
  time,
  setTime,
  selectedDays,
  toggleDay,
  dayOfMonth,
  setDayOfMonth,
  endDate,
  setEndDate,
  settings,
  ids,
}: RecurrenceFieldsProps): React.ReactElement {
  const showDaysOfWeek =
    recurrenceType === 'weekly' ||
    recurrenceType === 'weekdays' ||
    recurrenceType === 'daily';
  return (
    <>
      <fieldset className='fieldset'>
        <label className='label' htmlFor={ids.patternId}>
          Recurrence Pattern
        </label>
        <select
          id={ids.patternId}
          className='select'
          value={recurrenceType}
          onChange={(e) =>
            setRecurrenceType(e.target.value as RecurrencePattern['type'])
          }
          aria-label='Recurrence Pattern'
        >
          <option value='daily'>Daily</option>
          <option value='weekdays'>
            {(() => {
              const idx = computeWeekdayIndices(
                settings.startOfWeek,
                settings.startOfWeekend
              );
              const ordered = orderedWeekdayIndices(
                settings.startOfWeek
              ).filter((d) => idx.includes(d));
              const weekdays = ordered
                .map((d) => {
                  switch (d) {
                    case 0:
                      return 'Sun';
                    case 1:
                      return 'Mon';
                    case 2:
                      return 'Tue';
                    case 3:
                      return 'Wed';
                    case 4:
                      return 'Thu';
                    case 5:
                      return 'Fri';
                    case 6:
                      return 'Sat';
                    default:
                      return '';
                  }
                })
                .join(', ');
              return `Weekdays (${weekdays})`;
            })()}
          </option>
          <option value='weekly'>Weekly (custom)</option>
          <option value='monthly'>Monthly</option>
        </select>
      </fieldset>

      <fieldset className='fieldset'>
        <label className='label' htmlFor={ids.timeId}>
          Time
        </label>
        <input
          id={ids.timeId}
          type='time'
          className='input w-full'
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label='Wake time'
        />
      </fieldset>

      {showDaysOfWeek && (
        <fieldset className='fieldset'>
          <label className='label' htmlFor={ids.daysOfWeekId}>
            Days of Week
          </label>
          <div
            className='flex flex-wrap justify-start gap-2'
            role='group'
            aria-labelledby={ids.daysOfWeekId}
          >
            {orderedWeekdayIndices(settings.startOfWeek).map((d) => {
              const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
              return (
                <button
                  key={d}
                  type='button'
                  className={`btn btn-circle btn-sm ${selectedDays.includes(d) ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    // Do not clear current selection when switching patterns
                    if (recurrenceType !== 'weekly') {
                      setRecurrenceType('weekly');
                    }
                    toggleDay(d);
                  }}
                  aria-label={`Day ${d}`}
                  aria-pressed={selectedDays.includes(d)}
                >
                  {labels[d]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {recurrenceType === 'monthly' && (
        <fieldset className='fieldset'>
          <label className='label' htmlFor={ids.dayOfMonthId}>
            Day of Month
          </label>
          <select
            id={ids.dayOfMonthId}
            className='select'
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(Number(e.target.value))}
            aria-label='Day of month'
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      <fieldset className='fieldset'>
        <label className='label' htmlFor={ids.endDateId}>
          End Date (Optional)
        </label>
        <input
          id={ids.endDateId}
          type='date'
          className='input w-full'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          aria-label='End date'
        />
      </fieldset>
    </>
  );
}

export default RecurrenceFields;
