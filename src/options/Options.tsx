import React, { useEffect, useState } from 'react';

import { SnoozedTab } from '../types';

// Defining the component as a function declaration per ESLint rule
function Options(): React.ReactElement {
  const [snoozedTabItems, setSnoozedTabs] = useState<SnoozedTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  // Function to toggle theme
  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // Save theme preference
    chrome.storage.local.set({ theme: newTheme });
  };

  // Load theme preference and snoozed tabs on component mount
  useEffect(() => {
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

    loadTheme();
    loadSnoozedTabs();

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
    <div className='card bg-base-100 shadow-xl'>
      <div className='card-body'>
        <div className='overflow-x-auto'>
          <table className='table table-zebra'>
            <thead>
              <tr>
                <th>Tab</th>
                <th>Snooze Until</th>
                <th>Time Left</th>
                <th>Actions</th>
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
                          className='h-5 w-5'
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div
                        className='max-w-xs truncate'
                        title={tab.title || tab.url}
                      >
                        {tab.title || tab.url || 'Unknown tab'}
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(tab.wakeTime)}</td>
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
    </div>
  );
}

export default Options;
