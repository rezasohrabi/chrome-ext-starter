import React, { useRef } from 'react';
import {
  AlarmClock,
  AlertCircle,
  Clock,
  Download,
  Pencil,
  RotateCcw,
  StickyNote,
  Sunrise,
  Trash2,
  Upload,
} from 'lucide-react';

import { SnoozedTab } from '../types';

interface ManageSnoozedTabsProps {
  snoozedTabItems: SnoozedTab[];
  loading: boolean;
  wakeTabNow: (tab: SnoozedTab) => void;
  removeTab: (tab: SnoozedTab) => void;
  formatHumanFriendlyDate: (timestamp: number) => string;
  calculateTimeLeft: (wakeTime: number) => string;
  openTabInNewTab: (tab: SnoozedTab) => void;
  onEditTab?: (tab: SnoozedTab) => void;
  onExport?: () => void;
  onImportFileSelected?: (file: File) => void;
}

function ManageSnoozedTabs({
  snoozedTabItems,
  loading,
  wakeTabNow,
  removeTab,
  formatHumanFriendlyDate,
  calculateTimeLeft,
  openTabInNewTab,
  onEditTab = undefined,
  onExport = undefined,
  onImportFileSelected = undefined,
}: ManageSnoozedTabsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerImport = (): void => {
    fileInputRef.current?.click();
  };

  const renderLoading = () => (
    <div className='p-8 text-center'>
      <span className='loading loading-spinner loading-lg' />
    </div>
  );

  const renderEmptyState = () => (
    <div className='card bg-base-100 w-full shadow-xl'>
      <div className='card-body text-center'>
        <h2 className='card-title justify-center'>
          <AlertCircle className='text-warning mr-2 h-5 w-5' strokeWidth={2} />
          No Snoozed Tabs
        </h2>
        <p>
          You don&apos;t have any snoozed tabs at the moment. Snooze a tab by
          clicking the extension icon.
        </p>
      </div>
    </div>
  );

  const renderTabsTable = () => (
    <div className='overflow-x-auto px-0 sm:px-0 md:overflow-x-visible'>
      <table className='table-zebra table w-full min-w-[820px] md:min-w-0'>
        <thead>
          <tr>
            <th className='w-1/4'>Tab</th>
            <th className='w-1/4'>
              <div className='flex items-center'>
                <AlarmClock className='mr-1 h-4 w-4' strokeWidth={2} />
                Snooze Until
              </div>
            </th>
            <th className='w-1/6'>
              <div className='flex items-center'>
                <Clock className='mr-1 h-4 w-4' strokeWidth={2} />
                Time Left
              </div>
            </th>
            <th className='w-1/3 text-right'>Actions</th>
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
                      className='h-5 w-5 shrink-0'
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className='flex items-center'>
                    <button
                      type='button'
                      className='link link-primary max-w-[260px] truncate text-left sm:max-w-[360px]'
                      title={tab.title || tab.url}
                      onClick={() => openTabInNewTab(tab)}
                    >
                      {tab.title || tab.url || 'Unknown tab'}
                    </button>
                    {tab.isRecurring && (
                      <div className='tooltip' data-tip='Recurring snooze'>
                        <RotateCcw
                          className='text-accent ml-1.5 h-3.5 w-3.5'
                          strokeWidth={2.5}
                        />
                      </div>
                    )}
                    {tab.note && tab.note.trim().length > 0 && (
                      <div className='tooltip tooltip-right tooltip-info ml-1.5'>
                        <div className='tooltip-content max-w-[320px] text-left whitespace-pre-wrap'>
                          {tab.note}
                        </div>
                        <StickyNote
                          className='text-accent h-3.5 w-3.5'
                          strokeWidth={2.5}
                          aria-label='View note'
                        />
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className='whitespace-normal'>
                {formatHumanFriendlyDate(tab.wakeTime)}
              </td>
              <td>{calculateTimeLeft(tab.wakeTime)}</td>
              <td className='text-right'>
                <div className='flex flex-wrap justify-end gap-2'>
                  <button
                    type='button'
                    className='btn btn-primary btn-sm'
                    onClick={() => wakeTabNow(tab)}
                  >
                    <Sunrise className='mr-1 h-4 w-4' strokeWidth={2} />
                    Wake Now
                  </button>
                  {onEditTab && (
                    <div className='tooltip' data-tip='Edit'>
                      <button
                        type='button'
                        className='btn btn-outline btn-sm'
                        onClick={() => onEditTab(tab)}
                        aria-label='Edit'
                      >
                        <Pencil className='h-4 w-4' strokeWidth={2} />
                      </button>
                    </div>
                  )}
                  <div className='tooltip tooltip-error' data-tip='Delete tab'>
                    <button
                      type='button'
                      className='btn btn-outline btn-error btn-sm'
                      onClick={() => removeTab(tab)}
                      aria-label='Delete tab'
                    >
                      <Trash2 className='h-4 w-4' strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  let content: React.ReactElement;
  if (loading) {
    content = renderLoading();
  } else if (snoozedTabItems.length === 0) {
    content = renderEmptyState();
  } else {
    content = renderTabsTable();
  }

  return (
    <div className='card bg-base-200 border-base-300 mb-8 border shadow-2xl'>
      <div className='card-body'>
        <div className='mb-2 flex items-center justify-between'>
          <h1 className='card-title text-primary text-2xl font-bold'>
            Manage Snoozed Tabs
          </h1>
          <div className='flex items-center gap-2'>
            {onExport && (
              <button
                type='button'
                className='btn btn-outline btn-sm'
                onClick={onExport}
              >
                <Download className='mr-1 h-4 w-4' strokeWidth={2} />
                Export JSON
              </button>
            )}
            {onImportFileSelected && (
              <>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='application/json,.json'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportFileSelected(file);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                />
                <button
                  type='button'
                  className='btn btn-outline btn-sm'
                  onClick={triggerImport}
                >
                  <Upload className='mr-1 h-4 w-4' strokeWidth={2} />
                  Import JSON
                </button>
              </>
            )}
          </div>
        </div>
        {content}
      </div>
    </div>
  );
}

ManageSnoozedTabs.defaultProps = {
  onEditTab: undefined,
  onExport: undefined,
  onImportFileSelected: undefined,
};

export default ManageSnoozedTabs;
