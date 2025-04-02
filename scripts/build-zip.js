#!/usr/bin/env node
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
let outputDir = rootDir; // Default to project root

// Check for output directory argument
const outputArgIndex = args.findIndex(
  (arg) => arg === '--output' || arg === '-o'
);
if (outputArgIndex !== -1 && args[outputArgIndex + 1]) {
  outputDir = path.resolve(args[outputArgIndex + 1]);

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

// Function to execute shell commands
const execPromise = (command, options = {}) =>
  new Promise((resolve, reject) => {
    exec(command, options, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });

// Extract version from manifest.ts using a simple regex approach
const extractVersionFromManifest = async () => {
  const manifestPath = path.join(rootDir, 'src', 'manifest.ts');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const versionMatch = manifestContent.match(/version:\s*['"]([^'"]+)['"]/);

  if (!versionMatch || !versionMatch[1]) {
    throw new Error('Could not extract version from manifest.ts');
  }

  return versionMatch[1];
};

const main = async () => {
  try {
    // Build the extension
    // eslint-disable-next-line no-console
    console.log('Building extension...');
    await execPromise('pnpm run build', { cwd: rootDir });

    const version = await extractVersionFromManifest();

    const zipFileName = `snoozr-v${version}.zip`;
    const zipFilePath = path.join(outputDir, zipFileName);

    // Remove existing zip file if it exists
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }

    // Zip the dist folder
    // eslint-disable-next-line no-console
    console.log(`Creating ${zipFileName} in ${outputDir}...`);
    await execPromise(
      `cd "${path.join(rootDir, 'dist')}" && zip -r "${zipFilePath}" ./*`
    );

    // eslint-disable-next-line no-console
    console.log(`Successfully created ${zipFilePath}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error building or zipping the extension:', error);
    process.exit(1);
  }
};

main();
