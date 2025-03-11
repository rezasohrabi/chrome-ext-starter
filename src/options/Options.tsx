import React, { useEffect, useState } from 'react';

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

  const formatDate = (timestamp: number): string =>
    new Date(timestamp).toLocaleString();

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
    <div className='card w-full bg-base-100 shadow-xl'>
      <div className='card-body text-center'>
        <h2 className='card-title justify-center'>No Snoozed Tabs</h2>
        <p>
          You don&apos;t have any snoozed tabs at the moment. Snooze a tab by
          clicking the extension icon.
        </p>
      </div>
    </div>
  );

  const renderTabsTable = (): React.ReactElement => (
    <div className='card w-full bg-base-100 shadow-xl'>
      <div className='card-body p-0'>
        <div className='w-full overflow-x-auto'>
          <table className='table table-zebra w-full'>
            <thead>
              <tr>
                <th className='w-1/4'>Tab</th>
                <th className='w-1/4'>Snooze Until</th>
                <th className='w-1/6'>Time Left</th>
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
                          className='h-5 w-5 flex-shrink-0'
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div
                        className='max-w-[160px] truncate sm:max-w-[220px]'
                        title={tab.title || tab.url}
                      >
                        {tab.title || tab.url || 'Unknown tab'}
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-normal'>
                    {formatDate(tab.wakeTime)}
                  </td>
                  <td>{calculateTimeLeft(tab.wakeTime)}</td>
                  <td>
                    <div className='flex space-x-2'>
                      <button
                        type='button'
                        className='btn btn-primary btn-sm'
                        onClick={() => wakeTabNow(tab)}
                      >
                        Wake Now
                      </button>
                      <button
                        type='button'
                        className='btn btn-outline btn-error btn-sm'
                        onClick={() => removeTab(tab)}
                      >
                        Delete
                      </button>
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
          className='btn btn-outline'
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
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
            <svg
              viewBox='0 0 24 24'
              width='16'
              height='16'
              stroke='currentColor'
              fill='currentColor'
              strokeWidth='0'
              className='opacity-90'
            >
              <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
            </svg>
            GitHub Repository
          </a>
          <div className='flex gap-4'>
            <a
              href='https://github.com/hardchor/snoozr/discussions/new?category=ideas'
              target='_blank'
              rel='noopener noreferrer'
              className='link link-accent'
            >
              Propose New Features
            </a>
            <a
              href='https://github.com/hardchor/snoozr/issues/new'
              target='_blank'
              rel='noopener noreferrer'
              className='link link-accent'
            >
              Report Issues
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Options;
