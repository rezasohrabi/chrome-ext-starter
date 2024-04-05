import postcssRemToPx from '@thedutchcoder/postcss-rem-to-px';
import autoprefixer from 'autoprefixer';
import postcssPrefixSelector from 'postcss-prefix-selector';

import tailwindcss from 'tailwindcss';

/**
 * Transforms a CSS selector based on a given prefix.
 * @param {string} prefix - The prefix to apply to the selector.
 * @param {string} selector - The original CSS selector.
 * @param {string} prefixedSelector - The CSS selector with the prefix applied.
 * @returns {string} The transformed CSS selector.
 */
function transformSelector(prefix, selector, prefixedSelector) {
  if ([':root', ':host', 'html', 'body'].includes(selector)) {
    return ':host';
  }
  if (
    ['[data-theme]', '[data-theme=light]', '[data-theme=dark]'].includes(
      selector
    )
  ) {
    return `:host ${selector}`;
  }
  return prefixedSelector;
}

/**
 * Configuration object for PostCSS plugins.
 * @type {Object}
 * @property {Function[]} plugins - Array of PostCSS plugins.
 */
const postcssConfig = {
  plugins: [
    // Apply Tailwind CSS
    tailwindcss(),

    // Add a prefix to all selectors
    postcssPrefixSelector({
      prefix: '#my-ext',
      transform: transformSelector,
    }),

    // Convert rem units to px
    postcssRemToPx(),

    // Add vendor prefixes
    autoprefixer(),
  ],
};

export default postcssConfig;
