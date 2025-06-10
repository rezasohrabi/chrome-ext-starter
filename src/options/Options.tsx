import React, { useEffect, useState } from 'react';
import { AlertCircle, Github, Lightbulb } from 'lucide-react';

import { SnoozedTab } from '../types';
import { calculateNextWakeTime } from '../utils/recurrence';
import { SnoozrSettings } from '../utils/settings';
import useSettings from '../utils/useSettings';
import useTheme from '../utils/useTheme';
import ManageSnoozedTabs from './ManageSnoozedTabs';
import SnoozrSettingsCard from './SnoozrSettingsCard';

function Options(): React.ReactElement {
  const [snoozedTabItems, setSnoozedTabs] = useState<SnoozedTab[]>([]);
  const [loading, setLoading] = useState(true);
  useTheme();

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

  const [settings, setSettings, settingsLoading] = useSettings();

  const handleSettingsChange = (partial: Partial<SnoozrSettings>) => {
    setSettings(partial);
  };

  return (
    <div className='container mx-auto max-w-3xl p-4'>
      <ManageSnoozedTabs
        snoozedTabItems={snoozedTabItems}
        loading={loading}
        wakeTabNow={wakeTabNow}
        removeTab={removeTab}
        formatHumanFriendlyDate={formatHumanFriendlyDate}
        calculateTimeLeft={calculateTimeLeft}
        openTabInNewTab={openTabInNewTab}
      />
      <SnoozrSettingsCard
        settings={settings}
        settingsLoading={settingsLoading}
        handleSettingsChange={handleSettingsChange}
      />
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
      <div className='text-base-content/70 mt-4 text-center text-xs'>
        Snoozr Version: {chrome.runtime.getManifest().version}
      </div>
    </div>
  );
}

export default Options;
