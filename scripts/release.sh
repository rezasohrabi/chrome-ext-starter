#!/bin/bash
# scripts/release.sh
# Usage: ./scripts/release.sh [vX.Y.Z]
# If no version is provided, the script will read the version from src/manifest.ts
# This script tags the release, pushes the tag, and creates a GitHub release with the build artefact.

set -e

# Print all commands and their arguments as they are executed
# set -x

echo "Starting release script..."

if [ -z "$1" ]; then
  # Extract version from manifest.ts (allow for whitespace and trailing comma)
  VERSION=$(grep -oE "version:[[:space:]]*'([0-9]+\.[0-9]+\.[0-9]+)'" src/manifest.ts | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
  if [ -z "$VERSION" ]; then
    echo "Could not extract version from src/manifest.ts"
    exit 1
  fi
  VERSION="v$VERSION"
else
  VERSION=$1
fi

echo "Release version: $VERSION"

ZIP_FILE="snoozr-${VERSION}.zip"
ZIP_FILE_ALT="snoozr-${VERSION#v}.zip"

echo "Looking for artefact: $ZIP_FILE or $ZIP_FILE_ALT"

if [ -f "$ZIP_FILE_ALT" ]; then
  ZIP_FILE="$ZIP_FILE_ALT"
fi

if [ ! -f "$ZIP_FILE" ]; then
  echo "Error: $ZIP_FILE not found. Build and package the extension first."
  exit 1
fi

echo "Checking if git tag $VERSION already exists..."
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "Git tag $VERSION already exists. Aborting release."
  exit 1
fi

echo "Tagging release $VERSION..."
git tag $VERSION
git push origin $VERSION

echo "Checking if GitHub release $VERSION already exists..."
if gh release view $VERSION >/dev/null 2>&1; then
  echo "GitHub release $VERSION already exists. Aborting upload."
  exit 1
fi

echo "Creating GitHub release and uploading artefact..."
gh release create $VERSION $ZIP_FILE --generate-notes --latest --fail-on-no-commits

echo "Release $VERSION created and artefact uploaded."
