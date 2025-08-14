import React, { useEffect, useId, useState } from 'react';
import { Link } from '@tanstack/react-router';

import RecurrenceFields from '../../components/RecurrenceFields';
import { RecurrencePattern, SnoozedTab } from '../../types';
import { computeWeekdayIndices, getAllDayIndices } from '../../utils/datetime';
import { calculateNextWakeTime } from '../../utils/recurrence';
import useSettings from '../../utils/useSettings';

// Accessible Form Control component using function declaration with destructured props

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

  // Set default time and days based on settings
  useEffect(() => {
    const now = new Date();
    setTime(
      `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
    );
    setDayOfMonth(now.getDate());
    if (recurrenceType === 'weekdays') {
      const weekdays = computeWeekdayIndices(
        settings.startOfWeek,
        settings.startOfWeekend
      );
      setSelectedDays(weekdays);
    } else if (recurrenceType === 'daily') {
      setSelectedDays(getAllDayIndices());
    } else if (recurrenceType === 'weekly') {
      if (selectedDays.length === 0) {
        setSelectedDays([now.getDay()]);
      }
    }
  }, [settings, recurrenceType, selectedDays.length]);

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
          <RecurrenceFields
            recurrenceType={recurrenceType}
            setRecurrenceType={(val) => setRecurrenceType(val)}
            time={time}
            setTime={(val) => setTime(val)}
            selectedDays={selectedDays}
            toggleDay={(d) => toggleDay(d)}
            dayOfMonth={dayOfMonth}
            setDayOfMonth={(val) => setDayOfMonth(val)}
            endDate={endDate}
            setEndDate={(val) => setEndDate(val)}
            settings={settings}
            ids={{
              patternId,
              timeId,
              daysOfWeekId,
              dayOfMonthId,
              endDateId,
            }}
          />

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
