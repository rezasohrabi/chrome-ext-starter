#!/bin/zsh
# scripts/release.sh
# Usage: ./scripts/release.sh vX.Y.Z
# This script tags the release, pushes the tag, and creates a GitHub release with the build artefact.

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 vX.Y.Z"
  exit 1
fi

VERSION=$1
ZIP_FILE="snoozr-${VERSION}.zip"

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
