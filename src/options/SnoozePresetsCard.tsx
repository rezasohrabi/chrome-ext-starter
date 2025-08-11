import React, { useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  ClockFading,
  Moon,
  Sunrise,
  Volleyball,
} from 'lucide-react';

import {
  buildPresetTitle,
  DEFAULT_SNOOZE_PRESETS,
  resetSnoozePresets,
  SnoozeIconName,
  SnoozePreset,
} from '../utils/presets';
import { SnoozrSettings } from '../utils/settings';

interface SnoozePresetsCardProps {
  settings: SnoozrSettings;
  presets: SnoozePreset[];
  setPresets: (next: SnoozePreset[]) => void;
  loading: boolean;
}

function SnoozePresetsCard({
  settings,
  presets,
  setPresets,
  loading,
}: SnoozePresetsCardProps): React.ReactElement {
  const [editing, setEditing] = useState<SnoozePreset | null>(null);

  const iconOptions: { value: SnoozeIconName; label: string }[] = useMemo(
    () => [
      { value: 'clock', label: 'Clock' },
      { value: 'moon', label: 'Moon' },
      { value: 'sunrise', label: 'Sunrise' },
      { value: 'volleyball', label: 'Volleyball' },
      { value: 'briefcase', label: 'Briefcase' },
    ],
    []
  );

  const upsertPreset = (preset: SnoozePreset) => {
    setPresets(
      presets.some((p) => p.id === preset.id)
        ? presets.map((p) => (p.id === preset.id ? preset : p))
        : [...presets, preset]
    );
    setEditing(null);
  };

  const removePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
  };

  const onReset = async () => {
    await resetSnoozePresets();
    setPresets(DEFAULT_SNOOZE_PRESETS);
  };

  return (
    <div className='card bg-base-200 border-base-300 mb-8 border shadow-2xl'>
      <div className='card-body'>
        <h2 className='card-title text-primary mb-2 text-2xl font-bold'>
          Snooze Presets
        </h2>
        {loading ? (
          <span className='loading loading-spinner loading-md' />
        ) : (
          <>
            <p className='text-base-content/70 mb-4'>
              Add, edit, remove, and reorder quick snooze options that appear in
              the popup.
            </p>

            <div className='space-y-3'>
              {presets.map((p) => {
                const iconMap: Record<
                  string,
                  React.ComponentType<{
                    className?: string;
                    strokeWidth?: number;
                  }>
                > = {
                  clock: ClockFading,
                  moon: Moon,
                  sunrise: Sunrise,
                  volleyball: Volleyball,
                  briefcase: BriefcaseBusiness,
                };
                const Icon = iconMap[p.icon || 'clock'];
                return (
                  <div key={p.id} className='card bg-base-100'>
                    <div className='flex flex-row items-center justify-between gap-4 p-3'>
                      <div className='flex min-w-0 items-center gap-3'>
                        {Icon && (
                          <Icon
                            className='text-accent h-5 w-5 flex-shrink-0'
                            strokeWidth={2}
                          />
                        )}
                        <div className='min-w-0'>
                          <div className='truncate font-medium'>
                            {buildPresetTitle(p, settings)}
                          </div>
                          <div className='text-base-content/70 truncate text-xs'>
                            {p.kind === 'relative'
                              ? `Relative: ${`${p.relative?.hours ?? 0}h`} ${p.relative?.days ? `+ ${p.relative.days}d` : ''}`
                              : `Rule: ${p.rule}`}
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-shrink-0 items-center gap-2'>
                        <button
                          type='button'
                          className='btn btn-sm'
                          onClick={() => setEditing(p)}
                        >
                          Edit
                        </button>
                        <button
                          type='button'
                          className='btn btn-sm btn-error'
                          onClick={() => removePreset(p.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className='mt-4 flex gap-2'>
              <button
                type='button'
                className='btn btn-primary'
                onClick={() =>
                  setEditing({
                    id: `custom_${Date.now()}`,
                    titleTemplate: 'New Preset',
                    kind: 'relative',
                    relative: { hours: 1 },
                    icon: 'clock',
                  })
                }
              >
                Add Preset
              </button>
              <button
                type='button'
                className='btn btn-outline'
                onClick={onReset}
              >
                Reset to Defaults
              </button>
            </div>

            {editing && (
              <dialog open className='modal'>
                <div className='modal-box'>
                  <h3 className='text-lg font-bold'>
                    {presets.some((p) => p.id === editing.id)
                      ? 'Edit Preset'
                      : 'Add Preset'}
                  </h3>
                  <form
                    className='mt-4 space-y-3'
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className='form-control'>
                      <label className='label' htmlFor='preset-id'>
                        <span className='label-text'>ID</span>
                      </label>
                      <input
                        id='preset-id'
                        className='input input-bordered w-full'
                        value={editing.id}
                        onChange={(e) =>
                          setEditing({ ...editing, id: e.target.value })
                        }
                      />
                    </div>
                    <div className='form-control'>
                      <label className='label' htmlFor='preset-title'>
                        <span className='label-text'>Title Template</span>
                      </label>
                      <input
                        id='preset-title'
                        className='input input-bordered w-full'
                        value={editing.titleTemplate}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            titleTemplate: e.target.value,
                          })
                        }
                      />
                      <span className='text-base-content/70 mt-1 text-xs'>
                        Use placeholders like {`{startOfDay}`}, {`{endOfDay}`},
                        {`{startOfWeekName}`}, {`{startOfWeekendName}`},{' '}
                        {`{hours}`}
                      </span>
                    </div>
                    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                      <div className='form-control'>
                        <label className='label' htmlFor='preset-kind'>
                          <span className='label-text'>Kind</span>
                        </label>
                        <select
                          id='preset-kind'
                          className='select select-bordered w-full'
                          value={editing.kind}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              kind: e.target.value as SnoozePreset['kind'],
                            })
                          }
                        >
                          <option value='relative'>Relative</option>
                          <option value='rule'>Rule</option>
                        </select>
                      </div>

                      <div className='form-control'>
                        <label className='label' htmlFor='preset-icon'>
                          <span className='label-text'>Icon</span>
                        </label>
                        <select
                          id='preset-icon'
                          className='select select-bordered w-full'
                          value={editing.icon}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              icon: e.target.value as SnoozeIconName,
                            })
                          }
                        >
                          {iconOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {editing.kind === 'relative' ? (
                      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                        <div className='form-control'>
                          <label className='label' htmlFor='preset-rel-hours'>
                            <span className='label-text'>Hours</span>
                          </label>
                          <input
                            id='preset-rel-hours'
                            className='input input-bordered w-full'
                            type='number'
                            value={editing.relative?.hours ?? 0}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                relative: {
                                  ...editing.relative,
                                  hours: Number(e.target.value),
                                },
                              })
                            }
                          />
                        </div>
                        <div className='form-control'>
                          <label className='label' htmlFor='preset-rel-days'>
                            <span className='label-text'>Days</span>
                          </label>
                          <input
                            id='preset-rel-days'
                            className='input input-bordered w-full'
                            type='number'
                            value={editing.relative?.days ?? 0}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                relative: {
                                  ...editing.relative,
                                  days: Number(e.target.value),
                                },
                              })
                            }
                          />
                        </div>
                        {null}
                      </div>
                    ) : (
                      <div className='form-control'>
                        <label className='label' htmlFor='preset-rule'>
                          <span className='label-text'>Rule</span>
                        </label>
                        <select
                          id='preset-rule'
                          className='select select-bordered w-full'
                          value={editing.rule}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              rule: e.target.value as SnoozePreset['rule'],
                            })
                          }
                        >
                          <option value='tonight'>Tonight</option>
                          <option value='tomorrow'>Tomorrow</option>
                          <option value='weekend'>This Weekend</option>
                          <option value='next_week'>Next Week</option>
                        </select>
                      </div>
                    )}

                    <div className='modal-action'>
                      <button
                        type='button'
                        className='btn btn-ghost'
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type='button'
                        className='btn btn-primary'
                        onClick={() => editing && upsertPreset(editing)}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </dialog>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SnoozePresetsCard;
