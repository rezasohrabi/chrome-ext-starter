import React from 'react';
import createShadowRoot from '@utils/createShadowRoot';

import styles from './index.css?inline';
import Options from './Options';

const root = createShadowRoot(styles);

root.render(<Options />);
