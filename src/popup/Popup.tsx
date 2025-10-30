import { JSX } from 'react';

export default function Popup(): JSX.Element {
  return (
    <div id='my-ext' className='container' data-theme='light'>
      <button type='button' className='btn btn-outline'>
        Default
      </button>
      <button type='button' className='btn btn-primary btn-outline'>
        Primary
      </button>
      <button type='button' className='btn btn-secondary btn-outline'>
        Secondary
      </button>
      <button type='button' className='btn btn-accent btn-outline'>
        Accent
      </button>
    </div>
  );
}
