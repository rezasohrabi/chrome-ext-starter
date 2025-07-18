/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { JSX } from 'react';

export default function Content(): JSX.Element {
  return (
    <div id='my-ext' className='container' data-theme='light'>
      <div className='flex flex-col gap-6 p-8'>
        <div className='mx-auto w-72 rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800'>
          <p className='text-gray-600 dark:text-white'>
            <span className='text-lg font-bold text-indigo-500'>“</span>
            To get social media testimonials like these, keep your customers
            engaged with your social media accounts by posting regularly
            yourself
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

        <div className='flex gap-2'>
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
        </div>

        <div className='flex gap-2'>
          <label className='input-bordered input flex items-center gap-2'>
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
          <label className='input-bordered input flex items-center gap-2'>
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
          <label className='input-bordered input flex items-center gap-2'>
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
          <label className='input-bordered input flex items-center gap-2'>
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
        </div>

        <div className='mt-10 flex gap-2'>
          <div
            className='tooltip tooltip-open tooltip-primary'
            data-tip='primary'
          >
            <button type='button' className='btn btn-primary'>
              primary
            </button>
          </div>
        </div>

        <div className='mt-8'>
          <div className='carousel w-full'>
            <div id='item1' className='carousel-item w-full'>
              <img
                src='https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp'
                className='w-full'
              />
            </div>
            <div id='item2' className='carousel-item w-full'>
              <img
                src='https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp'
                className='w-full'
              />
            </div>
            <div id='item3' className='carousel-item w-full'>
              <img
                src='https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp'
                className='w-full'
              />
            </div>
            <div id='item4' className='carousel-item w-full'>
              <img
                src='https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp'
                className='w-full'
              />
            </div>
          </div>
          <div className='flex w-full justify-center gap-2 py-2'>
            <a href='#item1' className='btn btn-xs'>
              1
            </a>
            <a href='#item2' className='btn btn-xs'>
              2
            </a>
            <a href='#item3' className='btn btn-xs'>
              3
            </a>
            <a href='#item4' className='btn btn-xs'>
              4
            </a>
          </div>
        </div>

        <div className='mt-8'>
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
                            src='https://img.daisyui.com/images/profile/demo/2@94.webp'
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
                            src='https://img.daisyui.com/images/profile/demo/3@94.webp'
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
                            src='https://img.daisyui.com/images/profile/demo/4@94.webp'
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
                            src='https://img.daisyui.com/images/profile/demo/5@94.webp'
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
      </div>
    </div>
  );
}
