import React from 'react';
import styles from '@assets/styles/index.css?inline';
import createShadowRoot from '@utils/createShadowRoot';

import Popup from './Popup';

const root = createShadowRoot(styles);

root.render(<Popup />);
