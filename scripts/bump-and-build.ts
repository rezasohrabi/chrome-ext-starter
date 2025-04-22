#!/usr/bin/env node
/* eslint-disable no-console */
// scripts/bump-and-build.ts
// Usage: pnpm tsx scripts/bump-and-build.ts <patch|minor|major|x.y.z>
// This script bumps the version in src/manifest.ts, runs pnpm build:zip, and prints the next release step.
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import semver from 'semver';

if (process.argv.length < 3) {
  console.error(
    'Usage: pnpm tsx scripts/bump-and-build.ts <patch|minor|major|x.y.z>'
  );
  process.exit(1);
}

const bumpType = process.argv[2];
const allowedBumps = ['patch', 'minor', 'major'];

// Use ESM-compatible directory resolution
const dirname = new URL('.', import.meta.url).pathname;
const manifestPath = path.resolve(dirname, '../src/manifest.ts');

const manifestContentRaw = fs.readFileSync(manifestPath, 'utf8');
const versionRegex = /version:\s*['"]([0-9]+\.[0-9]+\.[0-9]+)['"]/;
const match = manifestContentRaw.match(versionRegex);
if (!match) {
  console.error('Could not find version in src/manifest.ts');
  process.exit(1);
}
const currentVersion = match[1];

let newVersion: string;
if (allowedBumps.includes(bumpType)) {
  const bumped = semver.inc(currentVersion, bumpType as semver.ReleaseType);
  if (!bumped) {
    console.error('Failed to bump version.');
    process.exit(1);
  }
  newVersion = bumped;
  console.log(`Bumping version: ${currentVersion} -> ${newVersion}`);
} else if (semver.valid(bumpType)) {
  newVersion = bumpType.replace(/^v/, '');
  console.log(`Setting version to: ${newVersion}`);
} else {
  console.error(
    'Usage: pnpm tsx scripts/bump-and-build.ts <patch|minor|major|x.y.z>'
  );
  process.exit(1);
}

const manifestContent = manifestContentRaw.replace(
  versionRegex,
  `version: '${newVersion}'`
);

fs.writeFileSync(manifestPath, manifestContent, 'utf8');
console.log(`Bumped version in manifest.ts to ${newVersion}`);

// Commit and push the manifest change
try {
  execSync('git add src/manifest.ts', { stdio: 'inherit' });
  execSync(`git commit -m "chore: bump version to v${newVersion}"`, {
    stdio: 'inherit',
  });
  execSync('git push', { stdio: 'inherit' });
  console.log('Committed and pushed manifest version bump.');
} catch (err) {
  console.error('Failed to commit and push manifest version bump.');
  process.exit(1);
}

console.log('Running pnpm build:zip...');
try {
  execSync('pnpm build:zip', { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to run pnpm build:zip');
  process.exit(1);
}

console.log(
  `\nNext: Run ./scripts/release.sh v${newVersion} to tag and release.`
);
