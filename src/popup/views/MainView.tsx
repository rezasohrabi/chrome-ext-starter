// filepath: /home/burkhard/Code/snoozr/src/popup/views/MainView.tsx
import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';

import { SnoozeOption } from '../../types';
import useTheme from '../../utils/useTheme';

function MainView(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

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

  const snoozeOptions: SnoozeOption[] = [
    { id: 'later_today', label: 'Later Today (in 3h)', hours: 3 },
    {
      id: 'tonight',
      label: 'Tonight (at 6pm)',
      custom: true,
      calculateTime: () => {
        const today = new Date();
        today.setHours(18, 0, 0, 0); // 6pm
        // If it's already past 6pm, return current time + 1 hour
        if (today.getTime() < Date.now()) {
          return Date.now() + 60 * 60 * 1000;
        }
        return today.getTime();
      },
    },
    {
      id: 'tomorrow',
      label: 'Tomorrow (9am)',
      custom: true,
      calculateTime: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9am
        return tomorrow.getTime();
      },
    },
    {
      id: 'weekend',
      label: 'This Weekend (Saturday, 9am)',
      custom: true,
      calculateTime: () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday, 6 is Saturday
        const daysUntilSaturday = currentDay === 6 ? 7 : 6 - currentDay; // If today is Saturday, go to next Saturday

        const targetDate = new Date();
        targetDate.setDate(today.getDate() + daysUntilSaturday);
        targetDate.setHours(9, 0, 0, 0); // 9am
        return targetDate.getTime();
      },
    },
    {
      id: 'next_week',
      label: 'Next Week (Monday, 9am)',
      custom: true,
      calculateTime: () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
        const daysUntilMonday = currentDay === 1 ? 7 : (8 - currentDay) % 7; // If today is Monday, go to next Monday

        const targetDate = new Date();
        targetDate.setDate(today.getDate() + daysUntilMonday);
        targetDate.setHours(9, 0, 0, 0); // 9am
        return targetDate.getTime();
      },
    },
  ];

  const handleSnooze = async (option: SnoozeOption): Promise<void> => {
    if (!activeTab || !activeTab.id) return;

    let wakeTime: number;
    if (option.calculateTime) {
      wakeTime = option.calculateTime();
    } else {
      const now = Date.now();
      wakeTime =
        now +
        (option.hours ? option.hours * 60 * 60 * 1000 : 0) +
        (option.days ? option.days * 24 * 60 * 60 * 1000 : 0);
    }

    const tabInfo = {
      id: activeTab.id,
      url: activeTab.url,
      title: activeTab.title,
      favicon: activeTab.favIconUrl,
      createdAt: Date.now(),
      wakeTime,
    };

    // Save snoozed tab info to storage
    await chrome.storage.local.get({ snoozedTabs: [] }, async (data) => {
      const { snoozedTabs } = data;
      snoozedTabs.push(tabInfo);
      await chrome.storage.local.set({ snoozedTabs });

      // Create alarm for this tab
      await chrome.alarms.create(`snoozed-tab-${tabInfo.id}`, {
        when: wakeTime,
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
    <div className='card w-80 bg-base-100 shadow-xl'>
      <div className='card-body p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='card-title flex items-center text-primary'>
            <svg
              className='mr-2 h-6 w-6'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle
                cx='12'
                cy='12'
                r='9'
                stroke='currentColor'
                strokeWidth='2'
              />
              <path
                d='M12 7V12L15 15'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
            Snoozr
          </h2>
          <button
            type='button'
            className='btn btn-circle btn-ghost btn-sm'
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {activeTab && (
          <div className='mb-4 flex items-center rounded-lg bg-base-100 p-3 shadow-sm'>
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

        <div className='space-y-2'>
          {snoozeOptions.map((option) => (
            <div key={option.id} className='card'>
              <button
                type='button'
                className='btn btn-block justify-start border-base-300 bg-base-200 hover:bg-base-300'
                onClick={() => handleSnooze(option)}
              >
                <svg
                  className='mr-2 h-5 w-5 text-accent'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <circle
                    cx='12'
                    cy='12'
                    r='9'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                  <path
                    d='M12 7V12L15 15'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                </svg>
                {option.label}
              </button>
            </div>
          ))}

          {/* Custom Date/Time button */}
          <div className='card'>
            <Link
              to='/custom-snooze'
              className='btn btn-block justify-start border-base-300 bg-base-200 hover:bg-base-300'
              viewTransition={{ types: ['slide-left'] }}
            >
              <svg
                className='mr-2 h-5 w-5 text-accent'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <rect
                  x='3'
                  y='4'
                  width='18'
                  height='16'
                  rx='2'
                  stroke='currentColor'
                  strokeWidth='2'
                />
                <path d='M3 10H21' stroke='currentColor' strokeWidth='2' />
                <path
                  d='M8 2L8 6'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <path
                  d='M16 2L16 6'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
              Pick a Date/Time
            </Link>
          </div>

          {/* Recurring Snooze button */}
          <div className='card'>
            <Link
              to='/recurring-snooze'
              className='btn btn-block justify-start border-base-300 bg-base-200 hover:bg-base-300'
              viewTransition={{ types: ['slide-left'] }}
            >
              <svg
                className='mr-2 h-5 w-5 text-accent'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <path
                  d='M12 7V12L15 15'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
                <path
                  d='M2 4L6 8M6 4L2 8'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              Recurring Snooze
            </Link>
          </div>
        </div>

        <div className='mt-4 text-center'>
          <a
            href='options.html'
            target='_blank'
            className='link link-primary inline-flex items-center text-sm'
          >
            <svg
              className='mr-1 h-4 w-4'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M10.3246 4.31731C10.751 2.5609 13.249 2.5609 13.6754 4.31731C13.9508 5.45193 15.2507 5.99038 16.2478 5.38285C17.7913 4.44239 19.5576 6.2087 18.6172 7.75218C18.0096 8.74925 18.5481 10.0492 19.6827 10.3246C21.4391 10.751 21.4391 13.249 19.6827 13.6754C18.5481 13.9508 18.0096 15.2507 18.6172 16.2478C19.5576 17.7913 17.7913 19.5576 16.2478 18.6172C15.2507 18.0096 13.9508 18.5481 13.6754 19.6827C13.249 21.4391 10.751 21.4391 10.3246 19.6827C10.0492 18.5481 8.74926 18.0096 7.75219 18.6172C6.2087 19.5576 4.44239 17.7913 5.38285 16.2478C5.99038 15.2507 5.45193 13.9508 4.31731 13.6754C2.5609 13.249 2.5609 10.751 4.31731 10.3246C5.45193 10.0492 5.99037 8.74926 5.38285 7.75218C4.44239 6.2087 6.2087 4.44239 7.75219 5.38285C8.74926 5.99037 10.0492 5.45193 10.3246 4.31731Z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Manage snoozed tabs
          </a>
        </div>
      </div>
    </div>
  );
}

export default MainView;
