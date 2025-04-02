import React, { useEffect, useState } from 'react';
import {
  AlarmClock,
  AlertCircle,
  Clock,
  Github,
  Lightbulb,
  Moon,
  RotateCcw,
  Sun,
  Sunrise,
  Trash2,
} from 'lucide-react';

import { SnoozedTab } from '../types';
import useTheme from '../utils/useTheme';

// Defining the component as a function declaration per ESLint rule
function Options(): React.ReactElement {
  const [snoozedTabItems, setSnoozedTabs] = useState<SnoozedTab[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

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
        // Create a new tab with the snoozed URL
        await chrome.tabs.create({ url: tab.url });
        // Remove the tab from storage
        const updatedTabs = snoozedTabItems.filter((t) => t.id !== tab.id);
        await chrome.storage.local.set({ snoozedTabs: updatedTabs });
        // Cancel the alarm
        await chrome.alarms.clear(`snoozed-tab-${tab.id}`);
        // Update state
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
    <div className='card bg-base-100 w-full shadow-xl'>
      <div className='card-body p-0'>
        <div className='w-full overflow-x-auto'>
          <table className='table-zebra table w-full'>
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
                <th className='w-1/3'>Actions</th>
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
                        <div
                          className='max-w-[160px] truncate sm:max-w-[220px]'
                          title={tab.title || tab.url}
                        >
                          {tab.title || tab.url || 'Unknown tab'}
                        </div>
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
                  <td>
                    <div className='flex space-x-2'>
                      <button
                        type='button'
                        className='btn btn-primary btn-sm'
                        onClick={() => wakeTabNow(tab)}
                      >
                        <Sunrise className='mr-1 h-4 w-4' strokeWidth={2} />
                        Wake Now
                      </button>
                      <div
                        className='tooltip tooltip-error'
                        data-tip='Delete tab'
                      >
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
      </div>
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

  return (
    <div className='container mx-auto max-w-3xl p-4'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Manage Snoozed Tabs</h1>
        <button
          type='button'
          className={`btn btn-circle btn-ghost text-${theme === 'silk' ? 'gray' : 'yellow'}-500`}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'silk' ? 'dark' : 'light'} mode`}
        >
          {theme === 'silk' ? (
            <Moon className='mr-2 h-4 w-4' strokeWidth={3} />
          ) : (
            <Sun className='mr-2 h-4 w-4' strokeWidth={3} />
          )}
        </button>
      </div>
      {content}

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
