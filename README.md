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

> The release script requires the [GitHub CLI](https://cli.github.com/) (`gh`) to be installed and authenticated.

1. ✏️ **Bump the version and build the zip** automatically:
   - Run `pnpm bump-and-build <patch|minor|major|x.y.z>`
   - This will:
     - Bump the version in `src/manifest.ts` (using [semver](https://www.npmjs.com/package/semver))
     - Run `pnpm build:zip` to generate the release artefact
2. 🤖 **Run the release script**:
   - Run `./scripts/release.sh`
   - This will:
     - Read the version from `src/manifest.ts`
     - Tag the release in git and push the tag
     - Create a GitHub release and upload the generated zip file as the artefact
3. 📤 **Upload the generated zip** file to the Chrome Web Store Developer Dashboard

> Example: `pnpm bump-and-build minor` will bump the minor version, update the manifest, and build the zip.
