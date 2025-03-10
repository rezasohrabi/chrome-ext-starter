import React from 'react';
import ReactDOM from 'react-dom/client';

import Options from './Options';

// Fix import path to point to the correct location
import '../index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
