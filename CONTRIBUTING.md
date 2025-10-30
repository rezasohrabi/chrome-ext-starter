## Contributing to Chrome Extension Starter

Thanks for taking the time to contribute! This project is a production-grade MV3 starter using Vite, React 19, TypeScript 5, Tailwind CSS 4, DaisyUI 5, and the CRX plugin. The guidelines below help us keep quality high and the developer experience smooth.

### Code of Conduct

This project follows our community guidelines. By participating, you agree to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md).

### Prerequisites

- Node.js >= 20.x
- pnpm >= 8.15.0
- Chrome/Edge (Chromium) and Firefox for testing

### Getting started

```bash
pnpm install

# Dev in Chrome/Chromium context
pnpm dev

# Dev (watch) in Firefox context
pnpm dev:firefox

# Lint
pnpm lint

# Build (Chrome)
pnpm build

# Build (Firefox)
pnpm build:firefox
```

### Project structure (high level)

- `src/background/` – MV3 service worker (module)
- `src/content/` – content script entries and UI (Shadow DOM)
- `src/popup/`, `src/options/` – extension pages
- `src/assets/` – fonts, styles (Tailwind + DaisyUI), images
- `src/utils/` – shared utilities (e.g., Shadow DOM bootstrap)
- `src/manifest.ts` – typed manifest builder (CRX plugin)

### Standards and conventions

- TypeScript strict mode; prefer precise types; avoid `any`.
- React functional components only; explicit `JSX.Element` return type.
- Use Tailwind utilities and DaisyUI components; avoid inline styles.
- Content scripts must render inside Shadow DOM; do not mutate page DOM directly.
- Keep root UI nodes with `id="my-ext"` and `data-theme` attributes.
- Use configured path aliases: `@/*`, `@utils`, `@assets`.
- Request minimal permissions in the manifest; prefer `webextension-polyfill` APIs.
- Follow import order: external → aliases → relative → styles last.

### Linting & formatting

- Run `pnpm lint` before opening a PR. Lint-staged and Prettier are enforced on commit.
- Spell-check: `pnpm lint:spell` when editing docs or user-facing strings.

### Commit messages (Conventional Commits)

We use commitlint with the Conventional Commits spec. Examples:

- `feat: render toolbar into Shadow DOM`
- `fix: prevent service worker timeout on first load`
- `chore: bump vite to 6.3.x`

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `build`, `ci`.

Create short, imperative subject lines; include an optional scope (folder or area), and a concise body when useful.

### Branching

- Feature: `feat/<short-topic>`
- Fix: `fix/<short-topic>`
- Chore/Docs: `chore/<short-topic>` or `docs/<short-topic>`

### Manual testing checklist

- Dev server works for your change (Chrome: `pnpm dev`, Firefox: `pnpm dev:firefox`).
- Build succeeds for both flavors (`pnpm build` and `pnpm build:firefox`).
- Load the built extension and verify:
  - Popup and Options pages render; no console errors.
  - Content script UI renders inside Shadow DOM with styles applied.
  - Background worker responds to messages.
- If you changed permissions or host matches, confirm they are strictly necessary and documented in the PR.

### Opening a Pull Request

- Ensure your branch is up-to-date with `main`.
- Keep commits clean and meaningful.
- Fill out the PR template completely (it helps reviewer a lot).
- Link related issues and include screenshots/GIFs when the UI changes.

### Reporting bugs / requesting features

Please use the provided GitHub Issue Forms (Bug report, Feature request). Include environment details (OS, browser, Node, pnpm) and clear steps to reproduce when applicable.

### Releases

Maintainers handle versioning and CHANGELOG updates. Contributors don’t need to bump versions in PRs unless explicitly requested.

Thank you for contributing and helping others build better browser extensions!
