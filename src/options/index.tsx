import React from 'react';
import { createRoot } from 'react-dom/client';

import Options from './Options';

import './index.css';

const root = createRoot(document.getElementById('my-ext-options')!);

root.render(<Options />);
