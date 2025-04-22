#!/bin/zsh
# scripts/release.sh
# Usage: ./scripts/release.sh [vX.Y.Z]
# If no version is provided, the script will read the version from src/manifest.ts
# This script tags the release, pushes the tag, and creates a GitHub release with the build artefact.

set -e

if [ -z "$1" ]; then
  # Extract version from manifest.ts
  VERSION=$(grep -oE "version: '[0-9]+\\.[0-9]+\\.[0-9]+'" src/manifest.ts | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+')
  if [ -z "$VERSION" ]; then
    echo "Could not extract version from src/manifest.ts"
    exit 1
  fi
  VERSION="v$VERSION"
else
  VERSION=$1
fi

ZIP_FILE="snoozr-${VERSION}.zip"
ZIP_FILE_ALT="snoozr-${VERSION#v}.zip"

if [ -f "$ZIP_FILE_ALT" ]; then
  ZIP_FILE="$ZIP_FILE_ALT"
fi

if [ ! -f "$ZIP_FILE" ]; then
  echo "Error: $ZIP_FILE not found. Build and package the extension first."
  exit 1
fi

echo "Tagging release $VERSION..."
git tag $VERSION
git push origin $VERSION

echo "Creating GitHub release and uploading artefact..."
gh release create $VERSION $ZIP_FILE --title "Snoozr $VERSION" --notes "See changelog for details."

echo "Release $VERSION created and artefact uploaded."
