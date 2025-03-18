# Snoozr Chrome Extension Custom Instructions

This is a Chrome extension that helps users manage their browser tabs by allowing them to temporarily hide ("snooze") tabs until a specific time or date.

We use TypeScript and React for development, with Vite as our build tool. Our styling is done with Tailwind CSS and DaisyUI.

When suggesting code changes or new features, please ensure they follow these conventions:

- Use TypeScript with strict type checking
- Prefer functional React components with hooks over class components
- Follow Chrome Extension Manifest V3 standards and best practices
- Use ES6+ JavaScript features

Our file structure separates concerns by feature:

- `src/background/` contains service worker code
- `src/content/` contains content scripts that run in webpage contexts
- `src/popup/` contains the extension popup UI
- `src/options/` contains the options page UI
- `src/utils/` contains shared utility functions

When suggesting UI components, ensure they support our dark mode implementation and follow the DaisyUI component patterns.

Prefer asynchronous messaging patterns when communicating between different extension contexts (background, content, popup).

For data persistence, we use Chrome's storage API (both sync and local storage depending on the data type).
