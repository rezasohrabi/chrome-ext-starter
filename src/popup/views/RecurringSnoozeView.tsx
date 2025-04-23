import React, { useEffect, useId, useState } from 'react';
import { Link } from '@tanstack/react-router';

import { RecurrencePattern, SnoozedTab } from '../../types';
import { calculateNextWakeTime } from '../../utils/recurrence';
import useSettings from '../../utils/useSettings';

// Accessible Form Control component using function declaration with destructured props
function FormControl({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <fieldset className='fieldset'>
      <label className='label' htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </fieldset>
  );
}

function RecurringSnoozeView(): React.ReactElement {
  // Generate unique IDs for form elements
  const patternId = useId();
  const timeId = useId();
  const daysOfWeekId = useId();
  const dayOfMonthId = useId();
  const endDateId = useId();

  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const [recurrenceType, setRecurrenceType] =
    useState<RecurrencePattern['type']>('daily');
  const [time, setTime] = useState<string>('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default to weekdays
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [endDate, setEndDate] = useState<string>('');
  const [settings] = useSettings();

  const weekDays = [
    { value: 0, label: 'S' },
    { value: 1, label: 'M' },
    { value: 2, label: 'T' },
    { value: 3, label: 'W' },
    { value: 4, label: 'T' },
    { value: 5, label: 'F' },
    { value: 6, label: 'S' },
  ];

  useEffect(() => {
    const getCurrentTab = async (): Promise<void> => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      setActiveTab(tab);
      setLoading(false);
    };
    getCurrentTab();
  }, []);

  useEffect(() => {
    // Always default time to the current time (HH:MM)
    const now = new Date();
    setTime(
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    );
    if (recurrenceType === 'daily') {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (recurrenceType === 'weekdays') {
      // Use settings.startOfWeekend to determine weekdays
      const weekend1 = settings.startOfWeekend;
      const weekend2 = (settings.startOfWeekend + 1) % 7;
      setSelectedDays(
        [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== weekend1 && d !== weekend2)
      );
    } else if (recurrenceType === 'weekly' || recurrenceType === 'custom') {
      setSelectedDays([now.getDay()]);
    }
  }, [settings, recurrenceType]);

  const toggleDay = (day: number): void => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSnooze = async (): Promise<void> => {
    if (!activeTab || !activeTab.id) return;

    // Create the recurrence pattern
    const recurrencePattern: RecurrencePattern = {
      type: recurrenceType,
      time,
      daysOfWeek: selectedDays,
    };
    if (recurrenceType === 'monthly') {
      recurrencePattern.dayOfMonth = dayOfMonth;
    }
    if (endDate) {
      recurrencePattern.endDate = new Date(endDate).getTime();
    }

    const firstWakeTimeMs = await calculateNextWakeTime(recurrencePattern);
    if (!firstWakeTimeMs) return;

    const tabInfo: SnoozedTab = {
      id: activeTab.id,
      url: activeTab.url,
      title: activeTab.title,
      favicon: activeTab.favIconUrl,
      createdAt: Date.now(),
      wakeTime: firstWakeTimeMs,
      isRecurring: true,
      recurrencePattern,
    };

    // Save snoozed tab info to storage
    await chrome.storage.local.get({ snoozedTabs: [] }, async (data) => {
      const { snoozedTabs } = data;
      snoozedTabs.push(tabInfo);
      await chrome.storage.local.set({ snoozedTabs });

      // Create alarm for this tab
      await chrome.alarms.create(`snoozed-tab-${tabInfo.id}`, {
        when: firstWakeTimeMs,
      });

      // Close the tab
      await chrome.tabs.remove(tabInfo.id);

      // Close the popup
      window.close();
    });
  };

  // Set default time and days based on settings
  useEffect(() => {
    setTime(settings.startOfDay);
    if (recurrenceType === 'weekdays') {
      setSelectedDays([1, 2, 3, 4, 5]);
    } else if (recurrenceType === 'weekly') {
      setSelectedDays([settings.startOfWeek]);
    } else if (recurrenceType === 'custom') {
      setSelectedDays([settings.startOfWeek, settings.startOfWeekend]);
    }
  }, [settings, recurrenceType]);

  if (loading) {
    return (
      <div className='flex min-h-[300px] items-center justify-center'>
        <span className='loading loading-spinner loading-lg' />
      </div>
    );
  }

  return (
    <div className='card bg-base-100 w-80 shadow-xl'>
      <div className='card-body p-5'>
        <div className='mb-4 flex items-center'>
          <Link
            to='/'
            className='btn btn-circle btn-ghost btn-sm mr-2'
            aria-label='Back to main menu'
            viewTransition={{ types: ['slide-right'] }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
              />
            </svg>
          </Link>
          <h2 className='card-title text-primary'>Recurring Snooze</h2>
        </div>

        {activeTab && (
          <div className='bg-base-100 mb-4 flex items-center rounded-lg p-3 shadow-2xs'>
            {activeTab.favIconUrl && (
              <img
                src={activeTab.favIconUrl}
                alt='Tab favicon'
                className='mr-3 h-5 w-5'
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className='truncate text-sm font-medium'>
              {activeTab.title}
            </div>
          </div>
        )}

        <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
          <FormControl label='Recurrence Pattern' htmlFor={patternId}>
            <select
              id={patternId}
              className='select'
              value={recurrenceType}
              onChange={(e) =>
                setRecurrenceType(e.target.value as RecurrencePattern['type'])
              }
              aria-label='Recurrence Pattern'
            >
              <option value='daily'>Daily</option>
              <option value='weekdays'>Weekdays (Mon-Fri)</option>
              <option value='weekly'>Weekly</option>
              <option value='monthly'>Monthly</option>
              <option value='custom'>Custom</option>
            </select>
          </FormControl>

          <FormControl label='Time' htmlFor={timeId}>
            <input
              id={timeId}
              type='time'
              className='input w-full'
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label='Wake time'
            />
          </FormControl>

          {(recurrenceType === 'weekly' || recurrenceType === 'custom') && (
            <FormControl label='Days of Week' htmlFor={daysOfWeekId}>
              <div
                className='flex justify-between'
                role='group'
                aria-labelledby={daysOfWeekId}
              >
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    type='button'
                    className={`btn btn-circle btn-sm ${
                      selectedDays.includes(day.value)
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    onClick={() => toggleDay(day.value)}
                    aria-label={`${day.label} day`}
                    aria-pressed={selectedDays.includes(day.value)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </FormControl>
          )}

          {recurrenceType === 'monthly' && (
            <FormControl label='Day of Month' htmlFor={dayOfMonthId}>
              <select
                id={dayOfMonthId}
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
            </FormControl>
          )}

          <FormControl label='End Date (Optional)' htmlFor={endDateId}>
            <input
              id={endDateId}
              type='date'
              className='input w-full'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label='End date'
            />
          </FormControl>

          <div className='card-actions mt-4'>
            <button
              type='button'
              className='btn btn-primary btn-block'
              onClick={handleSnooze}
            >
              Set Recurring Snooze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecurringSnoozeView;
