import React from 'react';

import useTheme from '../utils/useTheme';
import Router from './router';

// Using function declaration per ESLint rule
function Popup(): React.ReactElement {
  // Initialize theme
  useTheme();

  return <Router />;
}

export default Popup;
