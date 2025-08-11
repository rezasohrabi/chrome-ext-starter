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
import useSettings from '../../utils/useSettings';
import useTheme from '../../utils/useTheme';

function MainView(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
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

  const snoozeOptions: SnoozeOption[] = [
    {
      id: 'later_today',
      label: `Later (in ${settings.laterHours}h)`,
      hours: settings.laterHours,
      icon: ClockFading,
    },
    {
      id: 'tonight',
      label: `Tonight (at ${settings.endOfDay})`,
      custom: true,
      icon: Moon,
      calculateTime: () => {
        const today = new Date();
        const [h, m] = settings.endOfDay.split(':').map(Number);
        today.setHours(h, m, 0, 0);
        if (today.getTime() < Date.now()) {
          return Date.now() + 60 * 60 * 1000;
        }
        return today.getTime();
      },
    },
    {
      id: 'tomorrow',
      label: `Tomorrow (${settings.startOfDay})`,
      custom: true,
      icon: Sunrise,
      calculateTime: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [h, m] = settings.startOfDay.split(':').map(Number);
        tomorrow.setHours(h, m, 0, 0);
        return tomorrow.getTime();
      },
    },
    {
      id: 'weekend',
      label: `This Weekend (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][settings.startOfWeekend]}, ${settings.startOfDay})`,
      custom: true,
      icon: Volleyball,
      calculateTime: () => {
        const today = new Date();
        const currentDay = today.getDay();
        let daysUntil = settings.startOfWeekend - currentDay;
        if (daysUntil < 0) daysUntil += 7;
        if (daysUntil === 0) daysUntil = 7; // always go to next weekend
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + daysUntil);
        const [h, m] = settings.startOfDay.split(':').map(Number);
        targetDate.setHours(h, m, 0, 0);
        return targetDate.getTime();
      },
    },
    {
      id: 'next_week',
      label: `Next Week (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][settings.startOfWeek]}, ${settings.startOfDay})`,
      custom: true,
      icon: BriefcaseBusiness,
      calculateTime: () => {
        const today = new Date();
        const currentDay = today.getDay();
        let daysUntil = settings.startOfWeek - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + daysUntil);
        const [h, m] = settings.startOfDay.split(':').map(Number);
        targetDate.setHours(h, m, 0, 0);
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
    <div className='card bg-base-100 w-80 shadow-xl'>
      <div className='card-body p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='card-title text-primary flex items-center'>
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
            aria-label={`Switch to ${theme === 'silk' ? 'dark' : 'light'} mode`}
          >
            {theme === 'silk' ? '🌙' : '☀️'}
          </button>
        </div>

        {activeTab && (
          <div className='card card-border'>
            <div className='card-body'>
              <div className='mb-2 flex items-center'>
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
                <span className='truncate text-sm font-medium'>
                  {activeTab.title}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          {snoozeOptions.map((option) => (
            <div key={option.id} className='card'>
              <button
                type='button'
                className='btn btn-block border-base-300 bg-base-200 hover:bg-base-300 justify-start'
                onClick={() => handleSnooze(option)}
              >
                {option.icon && (
                  <option.icon
                    className='text-accent mr-2 h-5 w-5'
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
              className='btn btn-block border-base-300 bg-base-200 hover:bg-base-300 justify-start'
              viewTransition={{ types: ['slide-left'] }}
            >
              <Calendar className='text-accent mr-2 h-5 w-5' strokeWidth={2} />
              Pick a Date/Time
            </Link>
          </div>

          {/* Recurring Snooze button */}
          <div className='card'>
            <Link
              to='/recurring-snooze'
              className='btn btn-block border-base-300 bg-base-200 hover:bg-base-300 justify-start'
              viewTransition={{ types: ['slide-left'] }}
            >
              <RotateCcw className='text-accent mr-2 h-5 w-5' strokeWidth={2} />
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
