import React, { useEffect, useId, useState } from 'react';
import { AlertCircle, CheckCircle, Github, Lightbulb } from 'lucide-react';

import OneTimeSnoozeFields from '../components/OneTimeSnoozeFields';
import RecurrenceFields from '../components/RecurrenceFields';
import { RecurrencePattern, SnoozedTab, SnoozedTabsExport } from '../types';
import {
  calculateTimeLeft,
  computeWeekdayIndices,
  formatDateInputYMD,
  formatHumanFriendlyDate,
  formatTimeInputHM,
  getAllDayIndices,
} from '../utils/datetime';
import { calculateNextWakeTime } from '../utils/recurrence';
import { SnoozrSettings } from '../utils/settings';
import useSettings from '../utils/useSettings';
import useSnoozePresets from '../utils/useSnoozePresets';
import useTheme from '../utils/useTheme';
import ManageSnoozedTabs from './ManageSnoozedTabs';
import SnoozePresetsCard from './SnoozePresetsCard';
import SnoozrSettingsCard from './SnoozrSettingsCard';

function Options(): React.ReactElement {
  const [snoozedTabItems, setSnoozedTabs] = useState<SnoozedTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  useTheme();
  // Edit modal state
  const [editingTab, setEditingTab] = useState<SnoozedTab | null>(null);
  // One-time edit field (combined datetime-local)
  const [oneTimeDate, setOneTimeDate] = useState<string>('');
  // Recurring edit fields
  const [recurrenceType, setRecurrenceType] =
    useState<RecurrencePattern['type']>('daily');
  const [time, setTime] = useState<string>('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [endDate, setEndDate] = useState<string>('');
  const patternId = useId();
  const timeId = useId();
  const daysOfWeekId = useId();
  const dayOfMonthId = useId();
  const endDateId = useId();
  const dateTimeEditId = useId();

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

  const exportSnoozedTabs = async (): Promise<void> => {
    try {
      const { snoozedTabs = [] } =
        await chrome.storage.local.get('snoozedTabs');
      const payload: SnoozedTabsExport = {
        exportedWithVersion: chrome.runtime.getManifest().version,
        exportedAt: Date.now(),
        snoozedTabs: snoozedTabs as SnoozedTab[],
      };
      const dataStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `snoozr-snoozed-tabs-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (_) {
    } catch (error) {
      console.error('Failed to export snoozed tabs:', error);
      setImportStatus({ type: 'error', message: 'Failed to export snoozed tabs.' });
    }
  };

  const importSnoozedTabsFromFile = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      let snoozedTabsArray: SnoozedTab[] | null = null;

      try {
        const parsed = JSON.parse(text) as SnoozedTabsExport | SnoozedTab[];
        if (Array.isArray(parsed)) {
          snoozedTabsArray = parsed;
        } else if (
          parsed &&
          typeof parsed === 'object' &&
          Array.isArray((parsed as SnoozedTabsExport).snoozedTabs)
        ) {
          snoozedTabsArray = (parsed as SnoozedTabsExport).snoozedTabs;
        }
      } catch {
        setImportStatus({ type: 'error', message: 'Invalid JSON file.' });
        return;
      }

      if (!Array.isArray(snoozedTabsArray)) {
        setImportStatus({
          type: 'error',
          message: 'File format not recognized. Expected a Snoozr export JSON.',
        });
        return;
      }

      // Basic validation: keep only items with numeric id and wakeTime
      const validTabs = snoozedTabsArray.filter(
        (t) => typeof t?.id === 'number' && typeof t?.wakeTime === 'number'
      );
      if (validTabs.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'No valid snoozed tabs found in the file.',
        });
        return;
      }

      // Replace existing tabs in storage and recreate alarms
      await chrome.storage.local.set({ snoozedTabs: validTabs });
      setSnoozedTabs([...validTabs].sort((a, b) => a.wakeTime - b.wakeTime));

      // Clear existing alarms for current set in memory; best-effort
      try {
        const existingAlarms = await chrome.alarms.getAll();
        const toClear = existingAlarms
          .filter((a) => a.name.startsWith('snoozed-tab-'))
          .map((a) => a.name);
        await Promise.all(toClear.map((name) => chrome.alarms.clear(name)));
      } catch {
      } catch (err) {
        console.error('Failed to clear existing snoozed-tab alarms:', err);
      }

      // Recreate alarms for imported tabs
      await Promise.all(
        validTabs.map(async (tab) => {
          try {
            await chrome.alarms.create(`snoozed-tab-${tab.id}`, {
              when: tab.wakeTime,
            });
          } catch {
            // ignore
          }
        })
      );

      const skipped = snoozedTabsArray.length - validTabs.length;
      setImportStatus({
        type: 'success',
        message:
          skipped > 0
            ? `Imported ${validTabs.length} tabs. Skipped ${skipped} invalid entries.`
            : `Imported ${validTabs.length} tabs successfully.`,
      });
    } catch (error) {
      console.error('Failed to import snoozed tabs from file:', error);
      setImportStatus({ type: 'error', message: 'Failed to import file.' });
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

  // Helpers for Edit modal
  const [settings, setSettings, settingsLoading] = useSettings();
  const [presets, setPresets, presetsLoading] = useSnoozePresets();

  const formatDateForInput = (timestamp?: number): string => {
    if (!timestamp) return '';
    return formatDateInputYMD(new Date(timestamp));
  };

  const openEditTab = (tab: SnoozedTab): void => {
    setEditingTab(tab);
    const pattern = tab.recurrencePattern;
    const now = new Date();
    // Initialize one-time fields from current wake time
    const currentWake = new Date(tab.wakeTime);
    // Use combined datetime-local value for one-time editor
    setOneTimeDate(
      `${formatDateInputYMD(currentWake)}T${formatTimeInputHM(currentWake)}`
    );
    setTime(
      pattern?.time ||
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
    );
    if (pattern) {
      setRecurrenceType(pattern.type);
      setSelectedDays(
        pattern.daysOfWeek && pattern.daysOfWeek.length > 0
          ? [...pattern.daysOfWeek]
          : [now.getDay()]
      );
      setDayOfMonth(pattern.dayOfMonth || now.getDate());
      setEndDate(formatDateForInput(pattern.endDate));
    } else {
      setRecurrenceType('daily');
      setSelectedDays(getAllDayIndices());
      setDayOfMonth(now.getDate());
      setEndDate('');
    }
  };

  const closeEditRecurring = (): void => {
    setEditingTab(null);
  };

  const toggleDay = (day: number): void => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  // Align selectedDays with recurrenceType, mirroring popup behavior
  useEffect(() => {
    const now = new Date();
    if (recurrenceType === 'weekdays') {
      const weekdays = computeWeekdayIndices(
        settings.startOfWeek,
        settings.startOfWeekend
      );
      setSelectedDays(weekdays);
    } else if (recurrenceType === 'daily') {
      setSelectedDays(getAllDayIndices());
    } else if (recurrenceType === 'weekly') {
      setSelectedDays((prev) => (prev.length === 0 ? [now.getDay()] : prev));
    }
  }, [settings, recurrenceType]);

  const saveEditedRecurrence = async (): Promise<void> => {
    if (!editingTab) return;
    if (editingTab.isRecurring) {
      const recurrencePattern: RecurrencePattern = {
        type: recurrenceType,
        time,
        daysOfWeek: selectedDays,
      };
      if (recurrenceType === 'monthly') {
        recurrencePattern.dayOfMonth = dayOfMonth;
      }
      if (endDate) {
        recurrencePattern.endDate = new Date(endDate).getTime();
      }
      const nextWakeTime = await calculateNextWakeTime(recurrencePattern);
      if (!nextWakeTime) {
        closeEditRecurring();
        return;
      }
      try {
        const updatedTabs = snoozedTabItems.map((t) =>
          t.id === editingTab.id
            ? {
                ...t,
                isRecurring: true,
                recurrencePattern,
                wakeTime: nextWakeTime,
              }
            : t
        );
        await chrome.storage.local.set({ snoozedTabs: updatedTabs });
        await chrome.alarms.clear(`snoozed-tab-${editingTab.id}`);
        await chrome.alarms.create(`snoozed-tab-${editingTab.id}`, {
          when: nextWakeTime,
        });
        setSnoozedTabs(updatedTabs);
      } catch (e) {
        // Silent
      } finally {
        closeEditRecurring();
      }
    } else {
      // One-time snooze: update wake time
      if (!oneTimeDate) {
        closeEditRecurring();
        return;
      }
      const nextWakeTime = new Date(oneTimeDate).getTime();
      if (!Number.isFinite(nextWakeTime)) {
        closeEditRecurring();
        return;
      }
      try {
        const updatedTabs = snoozedTabItems.map((t) =>
          t.id === editingTab.id ? { ...t, wakeTime: nextWakeTime } : t
        );
        await chrome.storage.local.set({ snoozedTabs: updatedTabs });
        await chrome.alarms.clear(`snoozed-tab-${editingTab.id}`);
        await chrome.alarms.create(`snoozed-tab-${editingTab.id}`, {
          when: nextWakeTime,
        });
        setSnoozedTabs(updatedTabs);
      } catch (e) {
        // Silent
      } finally {
        closeEditRecurring();
      }
    }
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

  // Settings/presets already declared above for modal

  const handleSettingsChange = (partial: Partial<SnoozrSettings>) => {
    setSettings(partial);
  };

  return (
    <div className='container mx-auto max-w-6xl p-4'>
      {importStatus && (
        <div
          className={`alert mb-4 ${
            importStatus.type === 'error' ? 'alert-error' : 'alert-success'
          }`}
        >
          <div className='flex items-center'>
            {importStatus.type === 'error' ? (
              <AlertCircle className='h-5 w-5' strokeWidth={2} />
            ) : (
              <CheckCircle className='h-5 w-5' strokeWidth={2} />
            )}
            <span className='ml-2'>{importStatus.message}</span>
          </div>
          <div className='ml-auto'>
            <button
              type='button'
              className='btn btn-ghost btn-sm'
              onClick={() => setImportStatus(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <ManageSnoozedTabs
        snoozedTabItems={snoozedTabItems}
        loading={loading}
        wakeTabNow={wakeTabNow}
        removeTab={removeTab}
        formatHumanFriendlyDate={formatHumanFriendlyDate}
        calculateTimeLeft={calculateTimeLeft}
        openTabInNewTab={openTabInNewTab}
        onEditTab={openEditTab}
        onExport={exportSnoozedTabs}
        onImportFileSelected={importSnoozedTabsFromFile}
      />
      {/* Edit Snooze Modal */}
      <div className={`modal ${editingTab ? 'modal-open' : ''}`}>
        <div className='modal-box max-w-md'>
          <h3 className='mb-2 text-lg font-bold'>Edit Snooze</h3>
          {editingTab && (
            <div className='bg-base-100 mb-4 flex items-center rounded-lg p-3 shadow-2xs'>
              {editingTab.favicon && (
                <img
                  src={editingTab.favicon}
                  alt='Tab favicon'
                  className='mr-3 h-5 w-5'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className='truncate text-sm font-medium'>
                {editingTab.title || editingTab.url}
              </div>
            </div>
          )}

          <form className='space-y-3' onSubmit={(e) => e.preventDefault()}>
            {editingTab?.isRecurring ? (
              <RecurrenceFields
                recurrenceType={recurrenceType}
                setRecurrenceType={(val) => setRecurrenceType(val)}
                time={time}
                setTime={(val) => setTime(val)}
                selectedDays={selectedDays}
                toggleDay={(d) => toggleDay(d)}
                dayOfMonth={dayOfMonth}
                setDayOfMonth={(val) => setDayOfMonth(val)}
                endDate={endDate}
                setEndDate={(val) => setEndDate(val)}
                settings={settings}
                ids={{
                  patternId,
                  timeId,
                  daysOfWeekId,
                  dayOfMonthId,
                  endDateId,
                }}
              />
            ) : (
              <OneTimeSnoozeFields
                mode='single'
                dateTime={oneTimeDate}
                setDateTime={(val) => setOneTimeDate(val)}
                ids={{ dateTimeId: dateTimeEditId }}
              />
            )}

            <div className='modal-action'>
              <button
                type='button'
                className='btn btn-ghost'
                onClick={closeEditRecurring}
              >
                Cancel
              </button>
              <button
                type='button'
                className='btn btn-primary'
                onClick={saveEditedRecurrence}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
      <SnoozrSettingsCard
        settings={settings}
        settingsLoading={settingsLoading}
        handleSettingsChange={handleSettingsChange}
      />
      <SnoozePresetsCard
        settings={settings}
        presets={presets}
        setPresets={setPresets}
        loading={presetsLoading}
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
