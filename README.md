# Snoozr Chrome Extension 💤

Temporarily put tabs to sleep and have them reappear exactly when you need them! Snoozr helps you manage your browser tabs by letting you hide tabs until a specific time or date, reducing clutter and improving productivity.

## Features

- 💤 **Snooze Tabs**: Hide tabs until you need them again
- ⏰ **Flexible Timing**: Snooze tabs for preset times (later today, tomorrow, next week) or a custom date/time
- 🔔 **Notifications**: Get notified when your snoozed tabs wake up
- 📋 **Snooze Manager**: View and manage all your snoozed tabs in one place
- 🌙 **Dark Mode Support**: Easy on the eyes with automatic theme detection

## Technology Stack

- 🛠️ **Vite**: for lightning-fast development and hot module replacement
- 🧰 **TypeScript**: for type safety and enhanced productivity
- ⚛️ **React**: for building dynamic and interactive UI components
- 📦 **CRX**: for easy packaging and distribution of your extension
- 🎨 **Tailwind CSS**: for hassle-free styling
- 🌼 **DaisyUI**: for beautiful UI elements

## Usage Instructions

1. 📥 Install the extension from the Chrome Web Store or load it unpacked
2. 🖱️ Right-click on a tab or click the extension icon to snooze a tab
3. ⏱️ Select when you want the tab to reappear
4. 💤 The tab will close and reopen at the specified time

## Development

1. 📥 Clone the repository
2. 🔧 Install dependencies with `pnpm install`
3. 🚀 Start development server with `pnpm dev`
4. 🏗️ Build the extension for production with `pnpm build`

## Releasing to Chrome Web Store

1. ✏️ **Bump the version** in `src/manifest.ts` to match the new release version
2. 🏗️ **Build and package the extension** with `pnpm build:zip`
   - This will create a versioned zip file (e.g., `snoozr-v1.1.1.zip`) based on the version in your manifest
   - To specify a custom output directory: `pnpm build:zip -- -o path/to/directory`
3. 🏷️ **Tag the release in git**:
   - Run `git tag vX.Y.Z` (replace with your version)
   - Run `git push origin vX.Y.Z` to push the tag to the remote repository
4. 🚀 **Create a release on GitHub**:
   - You can do this via the GitHub web UI or using the CLI (`gh release create vX.Y.Z`)
5. 📤 **Upload the generated zip** file to the Chrome Web Store Developer Dashboard
