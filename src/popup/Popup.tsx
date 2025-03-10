import React, { useEffect, useState } from 'react';

import { SnoozeOption } from '../types';

// Using function declaration per ESLint rule
function Popup(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const getCurrentTab = async (): Promise<void> => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      setActiveTab(tab);
      setLoading(false);
    };

    // Check for saved theme or use system preference
    const loadTheme = async (): Promise<void> => {
      try {
        const { theme: savedTheme } = await chrome.storage.local.get('theme');

        // If no saved theme, check system preference
        if (!savedTheme) {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          const systemTheme = prefersDark ? 'dark' : 'light';
          setTheme(systemTheme);
          document.documentElement.setAttribute('data-theme', systemTheme);
        } else {
          setTheme(savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
      } catch (error) {
        // Use light theme as fallback
        setTheme('light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    getCurrentTab();
    loadTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = async (e: MediaQueryListEvent): Promise<void> => {
      try {
        // Check if user has explicitly set a preference
        const { theme: savedTheme } = await chrome.storage.local.get('theme');
        // Only update if user hasn't explicitly set a preference
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          setTheme(newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
        }
      } catch (error) {
        // Ignore errors
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle theme function
  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // Save theme preference
    chrome.storage.local.set({ theme: newTheme });
  };

  const snoozeOptions: SnoozeOption[] = [
    { id: 'later_today', label: 'Later Today', hours: 3 },
    { id: 'tonight', label: 'Tonight', hours: 8 },
    { id: 'tomorrow', label: 'Tomorrow', hours: 24 },
    { id: 'weekend', label: 'This Weekend', days: 2 },
    { id: 'next_week', label: 'Next Week', days: 7 },
    { id: 'custom', label: 'Pick a Date/Time', custom: true },
  ];

  const [customDate, setCustomDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [showCustom, setShowCustom] = useState(false);

  const handleSnooze = async (option: SnoozeOption): Promise<void> => {
    if (!activeTab || !activeTab.id) return;

    let wakeTime: number;
    if (option.custom && showCustom) {
      wakeTime = new Date(customDate).getTime();
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
          <h2 className='card-title flex items-center text-blue-600'>
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
            Snooze Tab
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
          <div className='mb-4 flex items-center rounded-lg bg-base-200 p-3'>
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
            <div key={option.id}>
              {option.custom ? (
                <div>
                  <button
                    type='button'
                    className='btn btn-block mb-2 justify-between border-base-300 bg-base-200 hover:bg-base-300'
                    onClick={() => setShowCustom(!showCustom)}
                  >
                    <span className='flex items-center'>
                      <svg
                        className='mr-2 h-5 w-5 text-blue-500'
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
                        <path
                          d='M3 10H21'
                          stroke='currentColor'
                          strokeWidth='2'
                        />
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
                      {option.label}
                    </span>
                    <span>{showCustom ? '▲' : '▼'}</span>
                  </button>

                  {showCustom && (
                    <div className='card mb-2 bg-base-200'>
                      <div className='card-body p-4'>
                        <p className='mb-2 text-xs'>
                          Select when to bring this tab back
                        </p>
                        <input
                          type='datetime-local'
                          className='input input-bordered w-full'
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                        />
                        <div className='card-actions mt-3'>
                          <button
                            type='button'
                            className='btn btn-primary btn-block'
                            onClick={() => handleSnooze(option)}
                          >
                            Snooze until selected time
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type='button'
                  className='btn btn-block justify-start border-base-300 bg-base-200 hover:bg-base-300'
                  onClick={() => handleSnooze(option)}
                >
                  <svg
                    className='mr-2 h-5 w-5 text-blue-500'
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
              )}
            </div>
          ))}
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

export default Popup;
