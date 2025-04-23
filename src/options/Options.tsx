import React, { useEffect, useState } from 'react';
import {
  AlarmClock,
  AlertCircle,
  Clock,
  Github,
  Lightbulb,
  RotateCcw,
  Sunrise,
  Trash2,
} from 'lucide-react';

import { SnoozedTab } from '../types';
import { calculateNextWakeTime } from '../utils/recurrence';
import { SnoozrSettings } from '../utils/settings';
import useSettings from '../utils/useSettings';

function Options(): React.ReactElement {
  const [snoozedTabItems, setSnoozedTabs] = useState<SnoozedTab[]>([]);
  const [loading, setLoading] = useState(true);

  // Moved loadSnoozedTabs before its usage to fix hoisting issue
  const loadSnoozedTabs = async (): Promise<void> => {
    try {
      setLoading(true);
      const { snoozedTabs = [] } =
        await chrome.storage.local.get('snoozedTabs');
      // Sort tabs by wake time
      const sortedTabs = [...snoozedTabs].sort(
        (a, b) => a.wakeTime - b.wakeTime
      );
      setSnoozedTabs(sortedTabs);
    } catch (error) {
      // Silently handle error without console.error
    } finally {
      setLoading(false);
    }
  };

  // Load snoozed tabs on component mount
  useEffect(() => {
    loadSnoozedTabs();
  }, []);

  const wakeTabNow = async (tab: SnoozedTab): Promise<void> => {
    try {
      if (tab.url) {
        // Open the tab immediately
        await chrome.tabs.create({ url: tab.url });
        // Cancel the current alarm
        await chrome.alarms.clear(`snoozed-tab-${tab.id}`);
        const updatedTabs = snoozedTabItems.filter((t) => t.id !== tab.id);
        // If recurring, skip to the next occurrence instead of removing
        if (tab.isRecurring && tab.recurrencePattern) {
          // Get the next occurrence after the current one
          const nextWake = await calculateNextWakeTime(
            tab.recurrencePattern,
            new Date(tab.wakeTime + 1) // +1ms to ensure we skip the current
          );
          if (nextWake) {
            const newTabId = Date.now();
            const updatedTab: SnoozedTab = {
              ...tab,
              id: newTabId,
              wakeTime: nextWake,
            };
            updatedTabs.push(updatedTab);
            await chrome.alarms.create(`snoozed-tab-${newTabId}`, {
              when: nextWake,
            });
          }
        }
        await chrome.storage.local.set({ snoozedTabs: updatedTabs });
        setSnoozedTabs(updatedTabs);
      }
    } catch (error) {
      // Silently handle error without console.error
    }
  };

  const removeTab = async (tab: SnoozedTab): Promise<void> => {
    try {
      // Remove the tab from storage
      const updatedTabs = snoozedTabItems.filter((t) => t.id !== tab.id);
      await chrome.storage.local.set({ snoozedTabs: updatedTabs });
      // Cancel the alarm
      await chrome.alarms.clear(`snoozed-tab-${tab.id}`);
      // Update state
      setSnoozedTabs(updatedTabs);
    } catch (error) {
      // Silently handle error without console.error
    }
  };

  const formatHumanFriendlyDate = (timestamp: number): string => {
    const wakeDate = new Date(timestamp);
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const isToday =
      wakeDate.getDate() === now.getDate() &&
      wakeDate.getMonth() === now.getMonth() &&
      wakeDate.getFullYear() === now.getFullYear();

    const isTomorrow =
      wakeDate.getDate() === tomorrow.getDate() &&
      wakeDate.getMonth() === tomorrow.getMonth() &&
      wakeDate.getFullYear() === tomorrow.getFullYear();

    // Format time in 12-hour format with AM/PM
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    const timeStr = wakeDate.toLocaleTimeString(undefined, timeOptions);

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    if (isTomorrow) {
      return `Tomorrow at ${timeStr}`;
    }

    // For dates within the next 6 days, show the day of week
    const daysUntil = Math.floor(
      (wakeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < 7) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
      const dayName = wakeDate.toLocaleDateString(undefined, options);
      return `${dayName} at ${timeStr}`;
    }

    // For dates further in the future, show the month and day
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year:
        wakeDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    };
    const dateStr = wakeDate.toLocaleDateString(undefined, dateOptions);
    return `${dateStr} at ${timeStr}`;
  };

  const calculateTimeLeft = (wakeTime: number): string => {
    const now = Date.now();
    const diff = wakeTime - now;
    if (diff <= 0) return 'Now';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Opens the snoozed tab in a new tab without waking it up
  const openTabInNewTab = async (tab: SnoozedTab): Promise<void> => {
    if (tab.url) {
      try {
        await chrome.tabs.create({ url: tab.url });
      } catch (error) {
        // Silently handle error
      }
    }
  };

  // Rendering helpers using DaisyUI components
  const renderLoading = (): React.ReactElement => (
    <div className='p-8 text-center'>
      <span className='loading loading-spinner loading-lg' />
    </div>
  );

  const renderEmptyState = (): React.ReactElement => (
    <div className='card bg-base-100 w-full shadow-xl'>
      <div className='card-body text-center'>
        <h2 className='card-title justify-center'>
          <AlertCircle className='text-warning mr-2 h-5 w-5' strokeWidth={2} />
          No Snoozed Tabs
        </h2>
        <p>
          You don&apos;t have any snoozed tabs at the moment. Snooze a tab by
          clicking the extension icon.
        </p>
      </div>
    </div>
  );

  const renderTabsTable = (): React.ReactElement => (
    <div className='overflow-x-auto px-0 sm:px-0 md:overflow-x-visible'>
      <table className='table-zebra table w-full min-w-[700px] md:min-w-0'>
        <thead>
          <tr>
            <th className='w-1/4'>Tab</th>
            <th className='w-1/4'>
              <div className='flex items-center'>
                <AlarmClock className='mr-1 h-4 w-4' strokeWidth={2} />
                Snooze Until
              </div>
            </th>
            <th className='w-1/6'>
              <div className='flex items-center'>
                <Clock className='mr-1 h-4 w-4' strokeWidth={2} />
                Time Left
              </div>
            </th>
            <th className='w-1/3 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {snoozedTabItems.map((tab) => (
            <tr key={tab.id}>
              <td>
                <div className='flex items-center space-x-2'>
                  {tab.favicon && (
                    <img
                      src={tab.favicon}
                      alt='Tab favicon'
                      className='h-5 w-5 shrink-0'
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className='flex items-center'>
                    <button
                      type='button'
                      className='link link-primary max-w-[160px] truncate text-left sm:max-w-[220px]'
                      title={tab.title || tab.url}
                      onClick={() => openTabInNewTab(tab)}
                    >
                      {tab.title || tab.url || 'Unknown tab'}
                    </button>
                    {tab.isRecurring && (
                      <div className='tooltip' data-tip='Recurring snooze'>
                        <RotateCcw
                          className='text-accent ml-1.5 h-3.5 w-3.5'
                          strokeWidth={2.5}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className='whitespace-normal'>
                {formatHumanFriendlyDate(tab.wakeTime)}
              </td>
              <td>{calculateTimeLeft(tab.wakeTime)}</td>
              <td className='text-right'>
                <div className='flex justify-end space-x-2'>
                  <button
                    type='button'
                    className='btn btn-primary btn-sm'
                    onClick={() => wakeTabNow(tab)}
                  >
                    <Sunrise className='mr-1 h-4 w-4' strokeWidth={2} />
                    Wake Now
                  </button>
                  <div className='tooltip tooltip-error' data-tip='Delete tab'>
                    <button
                      type='button'
                      className='btn btn-outline btn-error btn-sm'
                      onClick={() => removeTab(tab)}
                      aria-label='Delete tab'
                    >
                      <Trash2 className='h-4 w-4' strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Using if/else instead of nested ternaries
  let content: React.ReactElement;
  if (loading) {
    content = renderLoading();
  } else if (snoozedTabItems.length === 0) {
    content = renderEmptyState();
  } else {
    content = renderTabsTable();
  }

  const [settings, setSettings, settingsLoading] = useSettings();

  const handleSettingsChange = (partial: Partial<SnoozrSettings>) => {
    setSettings(partial);
  };

  return (
    <div className='container mx-auto max-w-3xl p-4'>
      <div className='card bg-base-200 border-base-300 mb-8 border shadow-2xl'>
        <div className='card-body'>
          <h1 className='card-title text-primary mb-2 text-2xl font-bold'>
            Manage Snoozed Tabs
          </h1>
          {content}
        </div>
      </div>
      <div className='card bg-base-200 border-base-300 mb-8 border shadow-2xl'>
        <div className='card-body'>
          <h2 className='card-title text-primary mb-2 text-2xl font-bold'>
            Snoozr Settings
          </h2>
          <p className='text-base-content/70 mb-4'>
            Customize your preferred day and time settings for snoozing tabs.
            These will be used for quick snooze options and recurring schedules.
          </p>
          {settingsLoading ? (
            <span className='loading loading-spinner loading-md' />
          ) : (
            <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='form-control'>
                  <label className='label' htmlFor='startOfDay'>
                    <span
                      className='label-text font-semibold'
                      id='startOfDayLabel'
                    >
                      Start of the day
                    </span>
                  </label>
                  <input
                    id='startOfDay'
                    aria-labelledby='startOfDayLabel'
                    type='time'
                    className='input input-bordered input-primary'
                    value={settings.startOfDay}
                    onChange={(e) =>
                      handleSettingsChange({ startOfDay: e.target.value })
                    }
                  />
                </div>
                <div className='form-control'>
                  <label className='label' htmlFor='endOfDay'>
                    <span
                      className='label-text font-semibold'
                      id='endOfDayLabel'
                    >
                      End of the day
                    </span>
                  </label>
                  <input
                    id='endOfDay'
                    aria-labelledby='endOfDayLabel'
                    type='time'
                    className='input input-bordered input-primary'
                    value={settings.endOfDay}
                    onChange={(e) =>
                      handleSettingsChange({ endOfDay: e.target.value })
                    }
                  />
                </div>
                <div className='form-control'>
                  <label className='label' htmlFor='startOfWeek'>
                    <span
                      className='label-text font-semibold'
                      id='startOfWeekLabel'
                    >
                      Start of the week
                    </span>
                  </label>
                  <select
                    id='startOfWeek'
                    aria-labelledby='startOfWeekLabel'
                    className='select select-bordered select-primary'
                    value={settings.startOfWeek}
                    onChange={(e) =>
                      handleSettingsChange({
                        startOfWeek: Number(e.target.value),
                      })
                    }
                  >
                    {[
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ].map((d) => (
                      <option
                        key={d}
                        value={[
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ].indexOf(d)}
                      >
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='form-control'>
                  <label className='label' htmlFor='startOfWeekend'>
                    <span
                      className='label-text font-semibold'
                      id='startOfWeekendLabel'
                    >
                      Start of the weekend
                    </span>
                  </label>
                  <select
                    id='startOfWeekend'
                    aria-labelledby='startOfWeekendLabel'
                    className='select select-bordered select-primary'
                    value={settings.startOfWeekend}
                    onChange={(e) =>
                      handleSettingsChange({
                        startOfWeekend: Number(e.target.value),
                      })
                    }
                  >
                    {[
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ].map((d) => (
                      <option
                        key={d}
                        value={[
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ].indexOf(d)}
                      >
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className='mt-6 text-center text-sm'>
        <div className='flex flex-col items-center justify-center gap-2'>
          <a
            href='https://github.com/hardchor/snoozr'
            target='_blank'
            rel='noopener noreferrer'
            className='link link-primary flex items-center gap-2'
          >
            <Github className='h-4 w-4' strokeWidth={2} />
            GitHub Repository
          </a>
          <div className='flex gap-4'>
            <a
              href='https://github.com/hardchor/snoozr/discussions/new?category=ideas'
              target='_blank'
              rel='noopener noreferrer'
              className='link link-accent flex items-center'
            >
              <Lightbulb className='mr-1 h-4 w-4' strokeWidth={2} />
              Propose New Features
            </a>
            <a
              href='https://github.com/hardchor/snoozr/issues/new'
              target='_blank'
              rel='noopener noreferrer'
              className='link link-accent flex items-center'
            >
              <AlertCircle className='mr-1 h-4 w-4' strokeWidth={2} />
              Report Issues
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Options;
