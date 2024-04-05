/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { JSX } from 'react';

export default function Content(): JSX.Element {
  return (
    <div id='my-ext' className='container' data-theme='light'>
      <div className='mx-auto w-72 rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800'>
        <p className='text-gray-600 dark:text-white'>
          <span className='text-lg font-bold text-indigo-500'>“</span>
          To get social media testimonials like these, keep your customers
          engaged with your social media accounts by posting regularly yourself
          <span className='text-lg font-bold text-indigo-500'>”</span>
        </p>
        <div className='mt-4 flex items-center'>
          <a href='google.com' className='relative block'>
            <img
              alt='profil'
              src='https://www.tailwind-kit.com/images/person/1.jpg'
              className='mx-auto h-10 w-10 rounded-full object-cover '
            />
          </a>
          <div className='ml-2 flex flex-col justify-between'>
            <span className='text-sm font-semibold text-indigo-500'>
              Jean Miguel
            </span>
            <span className='flex items-center text-xs dark:text-gray-400'>
              User of Tail-Kit
              <img src='/icons/rocket.svg' className='ml-2 h-4 w-4' alt='' />
            </span>
          </div>
        </div>
      </div>
      <button type='button' className='btn btn-outline'>
        Default
      </button>
      <button type='button' className='btn btn-outline btn-primary'>
        Primary
      </button>
      <button type='button' className='btn btn-outline btn-secondary'>
        Secondary
      </button>
      <button type='button' className='btn btn-outline btn-accent'>
        Accent
      </button>
      <button type='button' className='btn btn-neutral'>
        Neutral
      </button>
      <button type='button' className='btn btn-primary'>
        Primary
      </button>
      <button type='button' className='btn'>
        Button
      </button>
      <button type='button' className='btn btn-secondary'>
        Secondary
      </button>
      <button type='button' className='btn btn-accent'>
        Accent
      </button>
      <button type='button' className='btn btn-ghost'>
        Ghost
      </button>
      <button type='button' className='btn btn-link'>
        Link
      </button>

      <label className='input input-bordered flex items-center gap-2'>
        <input type='text' className='grow' placeholder='Search' />
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 16 16'
          fill='currentColor'
          className='h-4 w-4 opacity-70'
        >
          <path
            fillRule='evenodd'
            d='M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z'
            clipRule='evenodd'
          />
        </svg>
      </label>
      <label className='input input-bordered flex items-center gap-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 16 16'
          fill='currentColor'
          className='h-4 w-4 opacity-70'
        >
          <path d='M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z' />
          <path d='M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z' />
        </svg>
        <input type='text' className='grow' placeholder='Email' />
      </label>
      <label className='input input-bordered flex items-center gap-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 16 16'
          fill='currentColor'
          className='h-4 w-4 opacity-70'
        >
          <path d='M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z' />
        </svg>
        <input type='text' className='grow' placeholder='Username' />
      </label>
      <label className='input input-bordered flex items-center gap-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 16 16'
          fill='currentColor'
          className='h-4 w-4 opacity-70'
        >
          <path
            fillRule='evenodd'
            d='M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z'
            clipRule='evenodd'
          />
        </svg>
        <input type='password' className='grow' value='password' />
      </label>

      <input
        type='text'
        placeholder='Type here'
        className='input input-bordered input-secondary w-full max-w-xs'
      />

      <div className='tooltip tooltip-open tooltip-primary' data-tip='primary'>
        <button type='button' className='btn btn-primary'>
          primary
        </button>
      </div>

      <div className='carousel carousel-center max-w-md space-x-4 rounded-box bg-neutral p-4'>
        <div className='carousel-item'>
          <img
            src='https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg'
            className='rounded-box'
          />
        </div>
        <div className='carousel-item'>
          <img
            src='https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg'
            className='rounded-box'
          />
        </div>
        <div className='carousel-item'>
          <img
            src='https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg'
            className='rounded-box'
          />
        </div>
        <div className='carousel-item'>
          <img
            src='https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg'
            className='rounded-box'
          />
        </div>
        <div className='carousel-item'>
          <img
            src='https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg'
            className='rounded-box'
          />
        </div>
        <div className='carousel-item'>
          <img
            src='https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg'
            className='rounded-box'
          />
        </div>
        <div className='carousel-item'>
          <img
            src='https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg'
            className='rounded-box'
          />
        </div>
      </div>

      <ul className='timeline timeline-vertical'>
        <li>
          <div className='timeline-middle'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='h-5 w-5'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='timeline-end timeline-box'>
            First Macintosh computer
          </div>
          <hr />
        </li>
        <li>
          <hr />
          <div className='timeline-middle'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='h-5 w-5'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='timeline-end timeline-box'>iMac</div>
          <hr />
        </li>
        <li>
          <hr />
          <div className='timeline-middle'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='h-5 w-5'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='timeline-end timeline-box'>iPod</div>
          <hr />
        </li>
        <li>
          <hr />
          <div className='timeline-middle'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='h-5 w-5'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='timeline-end timeline-box'>iPhone</div>
          <hr />
        </li>
        <li>
          <hr />
          <div className='timeline-middle'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='h-5 w-5'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='timeline-end timeline-box'>Apple Watch</div>
        </li>
      </ul>

      {/* The button to open modal */}
      <a href='#my_modal_8' className='btn'>
        open modal
      </a>
      {/* Put this part before </body> tag */}
      <div className='modal' role='dialog' id='my_modal_8'>
        <div className='modal-box'>
          <h3 className='text-lg font-bold'>Hello!</h3>
          <p className='py-4'>This modal works with anchor links</p>
          <div className='modal-action'>
            <a href='#' className='btn'>
              Yay!
            </a>
          </div>
        </div>
      </div>

      <div className='dropdown'>
        <div tabIndex={0} role='button' className='btn m-1'>
          Click
        </div>
        <ul
          tabIndex={0}
          className='menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow'
        >
          <li>
            <a>Item 1</a>
          </li>
          <li>
            <a>Item 2</a>
          </li>
        </ul>
      </div>

      <div className='tooltip tooltip-bottom tooltip-open' data-tip='hello'>
        <button className='btn'>Bottom</button>
      </div>

      <div role='tablist' className='tabs-boxed tabs'>
        <a role='tab' className='tab'>
          Tab 1
        </a>
        <a role='tab' className='tab tab-active'>
          Tab 2
        </a>
        <a role='tab' className='tab'>
          Tab 3
        </a>
      </div>

      <div className='overflow-x-auto'>
        <table className='table'>
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input type='checkbox' className='checkbox' />
                </label>
              </th>
              <th>Name</th>
              <th>Job</th>
              <th>Favorite Color</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            <tr>
              <th>
                <label>
                  <input type='checkbox' className='checkbox' />
                </label>
              </th>
              <td>
                <div className='flex items-center gap-3'>
                  <div className='avatar'>
                    <div className='mask mask-squircle h-12 w-12'>
                      <img
                        src='/tailwind-css-component-profile-2@56w.png'
                        alt='Avatar Tailwind CSS Component'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='font-bold'>Hart Hagerty</div>
                    <div className='text-sm opacity-50'>United States</div>
                  </div>
                </div>
              </td>
              <td>
                Zemlak, Daniel and Leannon
                <br />
                <span className='badge badge-ghost badge-sm'>
                  Desktop Support Technician
                </span>
              </td>
              <td>Purple</td>
              <th>
                <button className='btn btn-ghost btn-xs'>details</button>
              </th>
            </tr>
            {/* row 2 */}
            <tr>
              <th>
                <label>
                  <input type='checkbox' className='checkbox' />
                </label>
              </th>
              <td>
                <div className='flex items-center gap-3'>
                  <div className='avatar'>
                    <div className='mask mask-squircle h-12 w-12'>
                      <img
                        src='/tailwind-css-component-profile-3@56w.png'
                        alt='Avatar Tailwind CSS Component'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='font-bold'>Brice Swyre</div>
                    <div className='text-sm opacity-50'>China</div>
                  </div>
                </div>
              </td>
              <td>
                Carroll Group
                <br />
                <span className='badge badge-ghost badge-sm'>
                  Tax Accountant
                </span>
              </td>
              <td>Red</td>
              <th>
                <button className='btn btn-ghost btn-xs'>details</button>
              </th>
            </tr>
            {/* row 3 */}
            <tr>
              <th>
                <label>
                  <input type='checkbox' className='checkbox' />
                </label>
              </th>
              <td>
                <div className='flex items-center gap-3'>
                  <div className='avatar'>
                    <div className='mask mask-squircle h-12 w-12'>
                      <img
                        src='/tailwind-css-component-profile-4@56w.png'
                        alt='Avatar Tailwind CSS Component'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='font-bold'>Marjy Ferencz</div>
                    <div className='text-sm opacity-50'>Russia</div>
                  </div>
                </div>
              </td>
              <td>
                Rowe-Schoen
                <br />
                <span className='badge badge-ghost badge-sm'>
                  Office Assistant I
                </span>
              </td>
              <td>Crimson</td>
              <th>
                <button className='btn btn-ghost btn-xs'>details</button>
              </th>
            </tr>
            {/* row 4 */}
            <tr>
              <th>
                <label>
                  <input type='checkbox' className='checkbox' />
                </label>
              </th>
              <td>
                <div className='flex items-center gap-3'>
                  <div className='avatar'>
                    <div className='mask mask-squircle h-12 w-12'>
                      <img
                        src='/tailwind-css-component-profile-5@56w.png'
                        alt='Avatar Tailwind CSS Component'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='font-bold'>Yancy Tear</div>
                    <div className='text-sm opacity-50'>Brazil</div>
                  </div>
                </div>
              </td>
              <td>
                Wyman-Ledner
                <br />
                <span className='badge badge-ghost badge-sm'>
                  Community Outreach Specialist
                </span>
              </td>
              <td>Indigo</td>
              <th>
                <button className='btn btn-ghost btn-xs'>details</button>
              </th>
            </tr>
          </tbody>
          {/* foot */}
          <tfoot>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Job</th>
              <th>Favorite Color</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
