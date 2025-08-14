import React from 'react';

type SingleModeProps = {
  mode: 'single';
  dateTime: string;
  setDateTime: (val: string) => void;
  ids: { dateTimeId: string };
};

type SplitModeProps = {
  mode: 'split';
  date: string;
  setDate: (val: string) => void;
  time: string;
  setTime: (val: string) => void;
  ids: { dateId: string; timeId: string };
};

type OneTimeSnoozeFieldsProps = SingleModeProps | SplitModeProps;

function OneTimeSnoozeFields({
  mode,
  ...rest
}: OneTimeSnoozeFieldsProps): React.ReactElement {
  if (mode === 'single') {
    const { dateTime, setDateTime, ids } = rest as SingleModeProps;
    return (
      <fieldset className='fieldset'>
        <label className='label' htmlFor={ids.dateTimeId}>
          Date & Time
        </label>
        <input
          id={ids.dateTimeId}
          type='datetime-local'
          className='input w-full'
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          aria-label='Date and time'
        />
      </fieldset>
    );
  }

  const { date, setDate, time, setTime, ids } = rest as SplitModeProps;
  return (
    <>
      <fieldset className='fieldset'>
        <label className='label' htmlFor={ids.timeId}>
          Time
        </label>
        <input
          id={ids.timeId}
          type='time'
          className='input w-full'
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label='Time'
        />
      </fieldset>
      <fieldset className='fieldset'>
        <label className='label' htmlFor={ids.dateId}>
          Date
        </label>
        <input
          id={ids.dateId}
          type='date'
          className='input w-full'
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label='Date'
        />
      </fieldset>
    </>
  );
}

export default OneTimeSnoozeFields;
