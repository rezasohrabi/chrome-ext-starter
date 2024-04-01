import React from 'react';
import { createRoot } from 'react-dom/client';

import Content from './Content';

import './index.css';

const container = document.createElement('div');
container.setAttribute('id', 'my-ext-id');
const shadow = container.attachShadow({ mode: 'open' });
document.body.appendChild(container);

const root = createRoot(shadow);

root.render(<Content />);
