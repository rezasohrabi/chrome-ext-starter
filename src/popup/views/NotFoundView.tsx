import React from 'react';
import { Link } from '@tanstack/react-router';

function NotFoundView(): React.ReactElement {
  return (
    <div className='card w-80 bg-base-100 shadow-xl'>
      <div className='card-body p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='card-title flex items-center text-primary'>
            <svg
              className='mr-2 h-6 w-6'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle
                cx='12'
                cy='12'
                r='9'
                stroke='currentColor'
                strokeWidth='2'
              />
              <path
                d='M12 7V12L15 15'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
            Snoozr
          </h2>
        </div>

        <div className='py-8 text-center'>
          <svg
            className='mx-auto h-12 w-12 text-warning'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
          <h3 className='mt-4 text-lg font-semibold'>Page Not Found</h3>
          <p className='mt-2 text-sm text-base-content/70'>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className='mt-6'>
            <Link to='/' className='btn btn-primary'>
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundView;
