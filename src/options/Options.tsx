import React, { useEffect, useState } from 'react';

import { SnoozedTab } from '../types';

// Defining the component as a function declaration per ESLint rule
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

  // Rendering helpers to avoid nested ternaries
  const renderLoading = (): React.ReactElement => (
    <div className='p-8 text-center'>
      <div className='loading loading-spinner loading-lg' />
    </div>
  );

  const renderEmptyState = (): React.ReactElement => (
    <div className='card bg-base-200 p-8 text-center'>
      <h3 className='mb-2 text-xl'>No Snoozed Tabs</h3>
      <p className='text-gray-500'>
        You don&apos;t have any snoozed tabs at the moment. Snooze a tab by
        clicking the extension icon.
      </p>
    </div>
  );

  const renderTabsTable = (): React.ReactElement => (
    <div className='card overflow-hidden bg-base-200'>
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
      <h1 className='mb-6 text-2xl font-bold'>Manage Snoozed Tabs</h1>
      {content}
    </div>
  );
}

export default Options;
