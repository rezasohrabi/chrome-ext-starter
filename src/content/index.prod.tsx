import React from 'react';
import styles from '@assets/styles/index.css?inline';
import createShadowRoot from '@utils/createShadowRoot';

import Content from './Content';

const root = createShadowRoot(styles);

root.render(<Content />);
