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
- `src/content/` contains content scripts that run in webpage contexts (removed for now as not required)
- `src/popup/` contains the extension popup UI
- `src/options/` contains the options page UI
- `src/utils/` contains shared utility functions

When suggesting UI components, ensure they support our dark mode implementation and follow the DaisyUI component patterns.

Prefer asynchronous messaging patterns when communicating between different extension contexts (background, content, popup).

For data persistence, we use Chrome's storage API (both sync and local storage depending on the data type).

## Specialized Instructions

When working on specific types of tasks, refer to these detailed guides:

- **[New Feature Development](.github/prompts/new-feature.prompt.md)** - Use these instructions when implementing new features or functionality
- **[Troubleshooting Issues](.github/prompts/troubleshooting.prompt.md)** - Use these instructions when diagnosing and fixing bugs or issues

## Setup and Development

### Prerequisites

- Node.js (version 16 or higher)
- pnpm package manager
- Chrome browser for testing

### Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/hardchor/snoozr.git
   cd snoozr
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

   This will start Vite in development mode with hot module replacement.

4. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder from the project
   - The extension should now appear in your extensions list

### Building for Production

- **Build the extension**: `pnpm build`
- **Build and create zip for distribution**: `pnpm build:zip`

### Testing

- **Run tests**: `pnpm test`
- **Run tests in watch mode**: `pnpm test:watch`

#### Testing approach and rules

- **Runner**: Vitest 3 with globals enabled. Config lives in `vite.config.ts` under the `test` key. Types include `vitest/globals` in `tsconfig.json`.
- **Test file naming**: Use `.vitest.ts`/`.vitest.tsx`. Valid globs:
  - `src/**/*.vitest.{ts,tsx}`
  - `src/**/__tests__/**/*.vitest.{ts,tsx}`
- **Setup file**: Put shared test setup in `src/test/setup.ts` (referenced by `vite.config.ts`).
- **Mocking API**: Use `vi.*` instead of `jest.*`:
  - `vi.mock`, `vi.fn`, `vi.spyOn`, `vi.mocked(someFn)`. Do not use the `jest` namespace.
  - When mocking a module, return an object of named exports (not a bare default). See Vitest migration guide: [Migrating from Jest](https://vitest.dev/guide/migration.html#migrating-from-jest).
- **Chrome API mocking**:
  - Background code uses Promise-based `chrome.storage.local.get/set` and `chrome.alarms.create`. In tests, mock these to return Promises (e.g., `mockResolvedValue`), not callback style.
  - The settings utility (`src/utils/settings.ts`) uses callback-style `chrome.storage.sync.get/set`. In tests for settings, mock via callback invocation.
  - Capture event listeners by stubbing `addListener` and storing the callback for invocation in tests (e.g., `chrome.alarms.onAlarm.addListener(cb)`).
  - The background script serializes work through an internal async task queue; after triggering a listener, await a microtask (e.g., `await new Promise(r => setTimeout(r, 0))`) before asserting.
- **onStartup nuance**: Background registers multiple `runtime.onStartup` listeners. Tests should target the listener that processes overdue tabs (last registered in `src/background/index.ts`).
- **DOM/component tests**: Use jsdom. Either set `test.environment = 'jsdom'` in `vite.config.ts` or per-file with `// @vitest-environment jsdom`.
- **Coverage**: `@vitest/coverage-v8` is available. Run with `pnpm test --coverage`.
- **Examples**:
  - Background tests mock `chrome.*` with Promise-returning methods and invoke stored listener callbacks.
  - Settings tests mock `chrome.storage.sync` with callback-style implementations.

### Key Files to Know

- `src/manifest.ts` - Extension manifest configuration
- `src/popup/Popup.tsx` - Main popup component
- `src/background/index.ts` - Background service worker
- `src/options/Options.tsx` - Options page component
- `src/types/index.ts` - TypeScript type definitions
