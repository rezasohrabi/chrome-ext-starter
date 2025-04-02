// filepath: /home/burkhard/Code/snoozr/src/popup/views/MainView.tsx
import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  BriefcaseBusiness,
  Calendar,
  ClockFading,
  Moon,
  RotateCcw,
  Settings,
  Sunrise,
  Volleyball,
} from 'lucide-react';

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
    {
      id: 'later_today',
      label: 'Later Today (in 3h)',
      hours: 3,
      icon: ClockFading,
    },
    {
      id: 'tonight',
      label: 'Tonight (at 6pm)',
      custom: true,
      icon: Moon,
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
      icon: Sunrise,
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
      icon: Volleyball,
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
      icon: BriefcaseBusiness,
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
                {option.icon && (
                  <option.icon
                    className='mr-2 h-5 w-5 text-accent'
                    strokeWidth={2}
                  />
                )}
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
              <Calendar className='mr-2 h-5 w-5 text-accent' strokeWidth={2} />
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
              <RotateCcw className='mr-2 h-5 w-5 text-accent' strokeWidth={2} />
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
            <Settings className='mr-1 h-4 w-4' strokeWidth={2} />
            Manage snoozed tabs
          </a>
        </div>
      </div>
    </div>
  );
}

export default MainView;
