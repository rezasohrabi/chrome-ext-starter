import React from 'react';
import styles from '@assets/styles/index.css?inline';
import createShadowRoot from '@utils/createShadowRoot';

import Options from './Options';

const root = createShadowRoot(styles);

root.render(<Options />);
