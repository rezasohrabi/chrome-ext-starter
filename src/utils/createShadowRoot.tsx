import { createRoot } from 'react-dom/client';

/**
 * Creates a shadow root with the specified styles and returns a React root in it.
 * @param {string} styles - CSS styles to be applied to the shadow root.
 * @returns {ReactRoot} - React root rendered inside the shadow root.
 */
export default function createShadowRoot(styles: string) {
  // Create a container element to hold the shadow root
  const container = document.createElement('div');

  // Attach a shadow root to the container element
  const shadow = container.attachShadow({ mode: 'open' });

  // Create a new CSS style sheet and apply the specified styles
  const globalStyleSheet = new CSSStyleSheet();
  globalStyleSheet.replaceSync(styles);

  // Apply the style sheet to the shadow root
  shadow.adoptedStyleSheets = [globalStyleSheet];

  // Append the container element to the document body
  document.body.appendChild(container);

  // Return a React root created inside the shadow root
  return createRoot(shadow);
}
