import React, { useMemo, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlarmClock,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Calendar,
  ClockFading,
  Coffee,
  Flag,
  GripVertical,
  Hourglass,
  Moon,
  Star,
  Sun,
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

const iconButtonRef = React.createRef<HTMLButtonElement>();

function SortableRow({
  p,
  children,
}: {
  p: SnoozePreset;
  children: React.ReactNode;
}): React.ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: p.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} className='card bg-base-100'>
      <div className='flex flex-row items-center justify-between gap-4 p-3'>
        <button
          type='button'
          className='btn btn-ghost btn-sm mr-1 cursor-grab'
          aria-label='Drag to reorder'
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...attributes}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...listeners}
        >
          <GripVertical className='h-4 w-4' strokeWidth={2} />
        </button>
        {children}
      </div>
    </div>
  );
}

function SnoozePresetsCard({
  settings,
  presets,
  setPresets,
  loading,
}: SnoozePresetsCardProps): React.ReactElement {
  const [editing, setEditing] = useState<SnoozePreset | null>(null);
  const [iconMenuOpen, setIconMenuOpen] = useState(false);
  const handleIconDropdownBlur = (
    e: React.FocusEvent<HTMLDivElement>
  ): void => {
    const next = e.relatedTarget as Node | null;
    if (!next || !e.currentTarget.contains(next)) {
      setIconMenuOpen(false);
    }
  };

  const iconOptions: { value: SnoozeIconName; label: string }[] = useMemo(
    () => [
      { value: 'clock', label: 'Clock' },
      { value: 'alarm', label: 'Alarm' },
      { value: 'bell', label: 'Bell' },
      { value: 'calendar', label: 'Calendar' },
      { value: 'hourglass', label: 'Hourglass' },
      { value: 'coffee', label: 'Coffee' },
      { value: 'sun', label: 'Sun' },
      { value: 'sunrise', label: 'Sunrise' },
      { value: 'star', label: 'Star' },
      { value: 'flag', label: 'Flag' },
      { value: 'moon', label: 'Moon' },
      { value: 'bookmark', label: 'Bookmark' },
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

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = presets.findIndex((p) => p.id === String(active.id));
    const newIndex = presets.findIndex((p) => p.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    setPresets(arrayMove(presets, oldIndex, newIndex));
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

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={presets.map((x) => x.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-3'>
                  {presets.map((p) => {
                    const iconMap: Record<
                      string,
                      React.ComponentType<{
                        className?: string;
                        strokeWidth?: number;
                      }>
                    > = {
                      alarm: AlarmClock,
                      bell: Bell,
                      bookmark: Bookmark,
                      clock: ClockFading,
                      moon: Moon,
                      calendar: Calendar,
                      sunrise: Sunrise,
                      sun: Sun,
                      star: Star,
                      flag: Flag,
                      hourglass: Hourglass,
                      coffee: Coffee,
                      volleyball: Volleyball,
                      briefcase: BriefcaseBusiness,
                    };
                    const Icon = iconMap[p.icon || 'clock'];
                    return (
                      <SortableRow key={p.id} p={p}>
                        <div className='flex min-w-0 flex-1 items-center gap-3 text-left'>
                          {Icon && (
                            <Icon
                              className='text-accent h-5 w-5 flex-shrink-0'
                              strokeWidth={2}
                            />
                          )}
                          <div className='min-w-0 text-left'>
                            <div className='truncate text-left font-medium'>
                              {buildPresetTitle(p, settings)}
                            </div>
                            <div className='text-base-content/70 truncate text-left text-xs'>
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
                      </SortableRow>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

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
                <div className='modal-box overflow-visible'>
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
                        {`{hours}`}, {`{days}`}
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
                        <div
                          className='dropdown dropdown-end relative w-full'
                          onBlur={handleIconDropdownBlur}
                        >
                          <button
                            id='preset-icon'
                            type='button'
                            ref={iconButtonRef}
                            className='select select-bordered border-base-300 flex w-full items-center justify-between pr-8 text-left'
                            onClick={() => setIconMenuOpen((o) => !o)}
                          >
                            <span className='flex items-center gap-2'>
                              {(() => {
                                const map: Record<
                                  string,
                                  React.ComponentType<{
                                    className?: string;
                                    strokeWidth?: number;
                                  }>
                                > = {
                                  alarm: AlarmClock,
                                  bell: Bell,
                                  bookmark: Bookmark,
                                  clock: ClockFading,
                                  calendar: Calendar,
                                  moon: Moon,
                                  sunrise: Sunrise,
                                  sun: Sun,
                                  star: Star,
                                  flag: Flag,
                                  hourglass: Hourglass,
                                  coffee: Coffee,
                                  volleyball: Volleyball,
                                  briefcase: BriefcaseBusiness,
                                };
                                const Ico = map[editing.icon || 'clock'];
                                return Ico ? (
                                  <Ico className='h-4 w-4' strokeWidth={2} />
                                ) : null;
                              })()}
                              <span className='capitalize'>
                                {editing.icon || 'clock'}
                              </span>
                            </span>
                            {/* rely on native select-chevron styling from DaisyUI */}
                          </button>
                          {iconMenuOpen && (
                            <ul className='menu dropdown-content rounded-box bg-base-100 absolute right-0 z-50 mt-2 max-h-64 w-64 overflow-auto border p-2 shadow'>
                              {iconOptions.map((opt) => {
                                const map: Record<
                                  string,
                                  React.ComponentType<{
                                    className?: string;
                                    strokeWidth?: number;
                                  }>
                                > = {
                                  alarm: AlarmClock,
                                  bell: Bell,
                                  bookmark: Bookmark,
                                  clock: ClockFading,
                                  calendar: Calendar,
                                  moon: Moon,
                                  sunrise: Sunrise,
                                  sun: Sun,
                                  star: Star,
                                  flag: Flag,
                                  hourglass: Hourglass,
                                  coffee: Coffee,
                                  volleyball: Volleyball,
                                  briefcase: BriefcaseBusiness,
                                };
                                const Ico = map[opt.value];
                                return (
                                  <li key={opt.value}>
                                    <button
                                      type='button'
                                      className='flex items-center gap-2'
                                      onClick={() => {
                                        setEditing({
                                          ...editing,
                                          icon: opt.value,
                                        });
                                        setIconMenuOpen(false);
                                        iconButtonRef.current?.blur();
                                      }}
                                    >
                                      {Ico && (
                                        <Ico
                                          className='h-4 w-4'
                                          strokeWidth={2}
                                        />
                                      )}
                                      <span className='capitalize'>
                                        {opt.value}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
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
