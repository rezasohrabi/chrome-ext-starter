import React from 'react';

import { SnoozrSettings } from '../utils/settings';

interface SnoozrSettingsCardProps {
  settings: SnoozrSettings;
  settingsLoading: boolean;
  handleSettingsChange: (partial: Partial<SnoozrSettings>) => void;
}

function SnoozrSettingsCard({
  settings,
  settingsLoading,
  handleSettingsChange,
}: SnoozrSettingsCardProps): React.ReactElement {
  return (
    <div className='card bg-base-200 border-base-300 mb-8 border shadow-2xl'>
      <div className='card-body'>
        <h2 className='card-title text-primary mb-2 text-2xl font-bold'>
          Snoozr Settings
        </h2>
        {settingsLoading ? (
          <span className='loading loading-spinner loading-md' />
        ) : (
          <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
            <fieldset className='fieldset bg-base-100 border-base-300 rounded-box border p-4'>
              <legend className='fieldset-legend px-2 text-sm font-semibold'>
                Time & Day Settings
              </legend>
              <p className='text-base-content/70 mb-4'>
                Customize your preferred day and time settings for snoozing
                tabs. These will be used for quick snooze options and recurring
                schedules.
              </p>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='form-control'>
                  <label className='label' htmlFor='laterHours'>
                    <span className='label-text font-semibold' id='laterHoursLabel'>
                      Later duration (hours)
                    </span>
                  </label>
                  <input
                    id='laterHours'
                    aria-labelledby='laterHoursLabel'
                    type='number'
                    min='1'
                    className='input input-bordered input-primary w-full'
                    value={settings.laterHours}
                    onChange={(e) =>
                      handleSettingsChange({
                        laterHours: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className='form-control'>
                  <label className='label mb-1 block' htmlFor='startOfDay'>
                    <span
                      className='label-text font-semibold'
                      id='startOfDayLabel'
                    >
                      Start of the day
                    </span>
                  </label>
                  <input
                    id='startOfDay'
                    aria-labelledby='startOfDayLabel'
                    type='time'
                    className='input input-bordered input-primary w-full'
                    value={settings.startOfDay}
                    onChange={(e) =>
                      handleSettingsChange({ startOfDay: e.target.value })
                    }
                  />
                </div>
                <div className='form-control'>
                  <label className='label mb-1 block' htmlFor='endOfDay'>
                    <span
                      className='label-text font-semibold'
                      id='endOfDayLabel'
                    >
                      End of the day
                    </span>
                  </label>
                  <input
                    id='endOfDay'
                    aria-labelledby='endOfDayLabel'
                    type='time'
                    className='input input-bordered input-primary w-full'
                    value={settings.endOfDay}
                    onChange={(e) =>
                      handleSettingsChange({ endOfDay: e.target.value })
                    }
                  />
                </div>
                <div className='form-control'>
                  <label className='label mb-1 block' htmlFor='startOfWeek'>
                    <span
                      className='label-text font-semibold'
                      id='startOfWeekLabel'
                    >
                      Start of the week
                    </span>
                  </label>
                  <select
                    id='startOfWeek'
                    aria-labelledby='startOfWeekLabel'
                    className='select select-bordered select-primary w-full'
                    value={settings.startOfWeek}
                    onChange={(e) =>
                      handleSettingsChange({
                        startOfWeek: Number(e.target.value),
                      })
                    }
                  >
                    {[
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ].map((d) => (
                      <option
                        key={d}
                        value={[
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ].indexOf(d)}
                      >
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='form-control'>
                  <label className='label mb-1 block' htmlFor='startOfWeekend'>
                    <span
                      className='label-text font-semibold'
                      id='startOfWeekendLabel'
                    >
                      Start of the weekend
                    </span>
                  </label>
                  <select
                    id='startOfWeekend'
                    aria-labelledby='startOfWeekendLabel'
                    className='select select-bordered select-primary w-full'
                    value={settings.startOfWeekend}
                    onChange={(e) =>
                      handleSettingsChange({
                        startOfWeekend: Number(e.target.value),
                      })
                    }
                  >
                    {[
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ].map((d) => (
                      <option
                        key={d}
                        value={[
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ].indexOf(d)}
                      >
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>
            <fieldset className='fieldset bg-base-100 border-base-300 rounded-box border p-4'>
              <legend className='fieldset-legend px-2 text-sm font-semibold'>
                Tab Behavior
              </legend>
              <p className='text-base-content/70 mb-4'>
                Customize how tabs are opened when snoozed. You can choose to
                open them in the background or foreground (default).
              </p>
              <label className='label cursor-pointer justify-start'>
                <span className='label-text mr-4'>Open tabs in background</span>
                <input
                  type='checkbox'
                  className='toggle toggle-primary'
                  checked={settings.openInBg}
                  onChange={(e) =>
                    handleSettingsChange({ openInBg: e.target.checked })
                  }
                />
              </label>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}

export default SnoozrSettingsCard;
