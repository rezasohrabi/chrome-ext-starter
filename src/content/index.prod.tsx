import React from 'react';
import createShadowRoot from '@utils/createShadowRoot';

import Content from './Content';
import styles from './index.css?inline';

const root = createShadowRoot(styles);

root.render(<Content />);
