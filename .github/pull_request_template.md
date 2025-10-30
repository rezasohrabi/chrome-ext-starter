## Summary

Explain the motivation and context for this change. Link any related issues.

## Type of change

- [ ] feat (new feature)
- [ ] fix (bug fix)
- [ ] refactor (no functional change)
- [ ] docs (documentation only)
- [ ] chore/build/ci

## How has this been tested?

Describe the testing you performed. Include steps, commands, and manual checks.

## Screenshots (if UI changes)

Add screenshots or GIFs to help reviewers understand UI changes.

## Breaking changes

Call out any breaking changes and migration steps.

## Checklist

- [ ] Conventional Commit message is used (e.g., `feat(content): ...`)
- [ ] I ran `pnpm lint` and fixed any issues
- [ ] I built both targets: `pnpm build` and `pnpm build:firefox`
- [ ] I verified the content script renders in Shadow DOM with styles
- [ ] I tested Popup and Options pages load without console errors
- [ ] I documented any new permissions or host matches (if applicable)
