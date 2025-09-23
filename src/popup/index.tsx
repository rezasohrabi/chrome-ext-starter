import React from 'react';
import ReactDOM from 'react-dom/client';

import Popup from './Popup';

// Fix import path to point to the correct location
import '../index.css';

// Mark this document as the extension popup to allow CSS overrides
document.documentElement.classList.add('popup-root');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
