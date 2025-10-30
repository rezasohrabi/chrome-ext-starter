import { createRoot } from 'react-dom/client';

/**
 * Creates a shadow root with the specified styles and returns a React root in it.
 * @param {string} styles - CSS styles to be applied to the shadow root.
 * @returns {ReactRoot} - React root rendered inside the shadow root.
 */
export default function createShadowRoot(styles: string) {
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });

  // Create an internal mount node to avoid Xray wrapper issues in Firefox
  const mount = document.createElement('div');
  shadow.appendChild(mount);

  // Apply styles: prefer constructable stylesheets, fallback safely
  try {
    const supportsConstructable =
      'adoptedStyleSheets' in shadow &&
      'replaceSync' in
        (CSSStyleSheet.prototype as unknown as { replaceSync?: unknown });
    if (supportsConstructable) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(styles);
      shadow.adoptedStyleSheets = [sheet];
    } else {
      const styleEl = document.createElement('style');
      styleEl.textContent = styles;
      shadow.appendChild(styleEl);
    }
  } catch {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    shadow.appendChild(styleEl);
  }

  document.body.appendChild(host);
  return createRoot(mount);
}
