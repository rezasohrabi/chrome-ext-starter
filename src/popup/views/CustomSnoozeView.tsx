import React, { useEffect, useId, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';

import OneTimeSnoozeFields from '../../components/OneTimeSnoozeFields';
import { nextDayISOForDatetimeLocal } from '../../utils/datetime';

function CustomSnoozeView(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const [customDate, setCustomDate] = useState<string>(
    nextDayISOForDatetimeLocal()
  );
  const dateTimeId = useId();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedNote, setEditedNote] = useState<string>('');
  const toggleEdit = (): void => {
    setIsEditing((prev) => {
      const next = !prev;
      if (next && !editedTitle && activeTab?.title) {
        setEditedTitle(activeTab.title);
      }
      return next;
    });
  };

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

  const handleSnooze = async (): Promise<void> => {
    if (!activeTab || !activeTab.id) return;

    const wakeTime = new Date(customDate).getTime();

    const titleFromEditor = editedTitle.trim();
    const noteFromEditor = editedNote.trim();
    const tabInfo = {
      id: activeTab.id,
      url: activeTab.url,
      title: titleFromEditor || activeTab.title,
      favicon: activeTab.favIconUrl,
      note: noteFromEditor ? noteFromEditor.slice(0, 300) : undefined,
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    await handleSnooze();
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
        <div className='mb-4 flex items-center'>
          <Link
            to='/'
            className='btn btn-circle btn-ghost btn-sm mr-2'
            aria-label='Back to main menu'
            viewTransition={{ types: ['slide-right'] }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
              />
            </svg>
          </Link>
          <h2 className='card-title text-primary'>Pick a Date/Time</h2>
        </div>

        {activeTab && (
          <div className='bg-base-100 mb-4 rounded-lg p-3 shadow-2xs'>
            <div className='flex w-full items-center'>
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
              <div className='flex-1 truncate text-sm font-medium'>
                {editedTitle || activeTab.title}
              </div>
              <button
                type='button'
                className='btn btn-ghost btn-xs ml-2'
                onClick={toggleEdit}
                aria-label='Edit title and note'
              >
                <Pencil className='h-3.5 w-3.5' strokeWidth={2} />
              </button>
            </div>
            {isEditing && (
              <div className='mt-2 space-y-2'>
                <input
                  type='text'
                  className='input input-bordered input-sm w-full'
                  placeholder='Edit tab title'
                  maxLength={200}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <textarea
                  className='textarea textarea-bordered textarea-sm w-full'
                  placeholder='Add a note (optional)'
                  maxLength={300}
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='mb-4 space-y-4'>
            <p className='text-sm'>Select when to bring this tab back:</p>
            <OneTimeSnoozeFields
              mode='single'
              dateTime={customDate}
              setDateTime={(val) => setCustomDate(val)}
              ids={{ dateTimeId }}
            />
          </div>

          <button type='submit' className='btn btn-primary btn-block'>
            Snooze until selected time
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomSnoozeView;
