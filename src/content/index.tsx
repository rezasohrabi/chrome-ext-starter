import React from 'react';
import { createRoot } from 'react-dom/client';

import Content from './Content';
import styles from './index.css?inline';

const container = document.createElement('div');
const shadow = container.attachShadow({ mode: 'open' });
const globalStyleSheet = new CSSStyleSheet();
globalStyleSheet.replaceSync(styles);

shadow.adoptedStyleSheets = [globalStyleSheet];
document.body.appendChild(container);

const root = createRoot(shadow);

root.render(<Content />);
