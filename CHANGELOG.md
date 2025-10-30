# Changelog

All notable changes to this project will be documented in this file.

## v1.2.1

### What's Changed

- Support for Firefox. Now chrome-ext-starter supports Chrome, Edge, Brave, and Firefox with one codebase.

Full Changelog: Compare v1.0.0...v1.2.1

## v1.0.0

### What's Changed

- Fixed "Waiting for service worker" issue in Popup and Options pages
- Upgraded Vite from v5.2.0 to v6.3.5
- Upgraded Tailwind CSS from v3.4.3 to v4.1.11
- Upgraded @crxjs/vite-plugin from 1.0.14 to 2.0.3
- Upgraded DaisyUI from v4.9.0 to v5.0.46

Full Changelog: Compare v0.1.2...v1.0.0

## v0.1.2

A maintenance and compatibility-focused release that brings improved tooling, better support for new environments, and critical fixes for content script accessibility and JSX issues.

### What's New

#### Updated Build Setup

- Replaced @vitejs/plugin-react-swc with the more stable @vitejs/plugin-react for broader compatibility and fewer runtime quirks.
- Refined Rollup output configuration to properly handle font assets during the build process.

#### Dependency Upgrades

- Bumped React from 18.1.0 → 19.1.0
- Bumped ReactDOM from 18.2.x → 19.1.6
- Updated TypeScript from 5.2.2 → 5.8.3

#### Configuration & Compatibility

- Loosened Node.js version requirement to allow any 20.x version.
- Refined web_accessible_resources to allow wildcards and broader URL matches — helping resolve loading issues in more restrictive contexts.

#### Bug Fixes

- Fixed "Cannot use JSX unless the '--jsx' flag is provided" by ensuring proper TypeScript and Vite configuration.
- Temporarily adjusted web_accessible_resources to improve debugging during CSP-restricted environments (e.g., GitHub).

## v0.1.1

### What's Changed

- fix: style element cannot be found in dev mode (#8)
- fix: Vite config type errors (#9)
- fix: add chrome types (#10)
- merge v0.1.1 into main (#11)

Contributors: @rezasohrabi

Full Changelog: Compare v0.1.0...v0.1.1

## v0.1.0

### What's Started

- Implemented CRX for development and build processes to streamline extension packaging.
- Integrated Tailwind CSS and DaisyUI in content script, popup, and options pages for enhanced styling and UI components.
- Added Airbnb ESLint configuration and Prettier for consistent code formatting and style enforcement.
- Configured Husky, Pre-commit, and Commit Message to enforce code quality standards and automate pre-commit checks.
- Utilized Vite bundler for fast development and optimized production builds.
- Leveraged TypeScript for type safety and improved development experience.
- Adopted PNPM package manager for efficient dependency management.
